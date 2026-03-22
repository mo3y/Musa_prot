'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import LightningSystem from './LightningSystem';

type MouseRef = React.MutableRefObject<{ x: number; y: number }>;

// ─── Particle Network (nodes + connecting lines) ──────────────────────────────
const COUNT        = 140;
const CONNECT_DIST = 3.2;
const MAX_SEGS     = 2400;
const CONNECT_SQ   = CONNECT_DIST * CONNECT_DIST;

const LINE_VERT = /* glsl */`
  attribute float aAlpha;
  varying  float vAlpha;
  void main() {
    vAlpha      = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const LINE_FRAG = /* glsl */`
  varying float vAlpha;
  void main() {
    if (vAlpha < 0.01) discard;
    gl_FragColor = vec4(0.82, 0.94, 1.0, vAlpha * 0.5);
  }
`;
const NODE_VERT = /* glsl */`
  attribute float size;
  uniform  float uTime;
  varying  float vTw;
  void main() {
    vTw = 0.65 + 0.35 * sin(uTime * 1.6 + position.x * 2.1 + position.y * 1.8);
    vec4 mv    = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (190.0 / -mv.z) * vTw;
    gl_Position  = projectionMatrix * mv;
  }
`;
const NODE_FRAG = /* glsl */`
  varying float vTw;
  void main() {
    float d    = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float glow = smoothstep(0.5, 0.18, d) * 0.35;
    vec3  col  = mix(vec3(0.72, 0.9, 1.0), vec3(1.0, 1.0, 1.0), core);
    gl_FragColor = vec4(col, (core + glow) * vTw * 0.9);
  }
`;

function ParticleNetwork({ mouseRef }: { mouseRef: MouseRef }) {
  const { viewport } = useThree();

  const pos   = useMemo(() => {
    const p = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      p[i*3]   = (Math.random() - 0.5) * 22;
      p[i*3+1] = (Math.random() - 0.5) * 12;
      p[i*3+2] = (Math.random() - 0.5) * 5 - 1;
    }
    return p;
  }, []);

  const vel   = useMemo(() => {
    const v = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      v[i*3]   = (Math.random() - 0.5) * 0.035;
      v[i*3+1] = (Math.random() - 0.5) * 0.025;
    }
    return v;
  }, []);

  const sizes = useMemo(() => {
    const s = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) s[i] = 1.2 + Math.random() * 2.8;
    return s;
  }, []);

  // Pre-allocated buffers for line segments
  const linePos   = useMemo(() => new Float32Array(MAX_SEGS * 6), []);
  const lineAlpha = useMemo(() => new Float32Array(MAX_SEGS * 2), []);

  const pointsRef   = useRef<THREE.Points>(null!);
  const linesRef    = useRef<THREE.LineSegments>(null!);
  const nodeMatRef  = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime();
    const mwx = (mouseRef.current.x / (window.innerWidth  || 1) - 0.5) * viewport.width;
    const mwy = -(mouseRef.current.y / (window.innerHeight || 1) - 0.5) * viewport.height;

    // ── Move particles ─────────────────────────────────────────────────────
    for (let i = 0; i < COUNT; i++) {
      const xi = i*3, yi = xi+1;
      const dx = pos[xi] - mwx, dy = pos[yi] - mwy;
      const d2 = dx*dx + dy*dy;
      if (d2 < 6.25 && d2 > 0.0001) {
        const d   = Math.sqrt(d2);
        const str = (1 - d/2.5) * 0.014;
        vel[xi] += (dx/d) * str;
        vel[yi] += (dy/d) * str;
      }
      vel[xi] *= 0.97; vel[yi] *= 0.97;
      pos[xi] += vel[xi] + (Math.random()-0.5)*0.0015;
      pos[yi] += vel[yi] + (Math.random()-0.5)*0.0015;
      if (pos[xi] >  12) pos[xi] = -12;
      if (pos[xi] < -12) pos[xi] =  12;
      if (pos[yi] >   7) pos[yi] =  -7;
      if (pos[yi] <  -7) pos[yi] =   7;
    }

    // Sync particle point positions
    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      (attr.array as Float32Array).set(pos);
      attr.needsUpdate = true;
    }
    if (nodeMatRef.current) nodeMatRef.current.uniforms.uTime.value = t;

    // ── Build connection lines ─────────────────────────────────────────────
    let seg = 0;
    for (let i = 0; i < COUNT && seg < MAX_SEGS - 1; i++) {
      for (let j = i + 1; j < COUNT && seg < MAX_SEGS - 1; j++) {
        const dx = pos[j*3]   - pos[i*3];
        const dy = pos[j*3+1] - pos[i*3+1];
        const d2 = dx*dx + dy*dy;
        if (d2 < CONNECT_SQ) {
          const alpha = (1 - Math.sqrt(d2) / CONNECT_DIST) * 0.75;
          const b = seg * 6;
          linePos[b]   = pos[i*3];   linePos[b+1] = pos[i*3+1]; linePos[b+2] = pos[i*3+2];
          linePos[b+3] = pos[j*3];   linePos[b+4] = pos[j*3+1]; linePos[b+5] = pos[j*3+2];
          lineAlpha[seg*2]   = alpha;
          lineAlpha[seg*2+1] = alpha * 0.25;
          seg++;
        }
      }
    }

    if (linesRef.current) {
      const geo   = linesRef.current.geometry;
      const pAttr = geo.attributes.position as THREE.BufferAttribute;
      const aAttr = geo.attributes.aAlpha   as THREE.BufferAttribute;
      (pAttr.array as Float32Array).set(linePos);
      (aAttr.array as Float32Array).set(lineAlpha);
      pAttr.needsUpdate = true;
      aAttr.needsUpdate = true;
      geo.setDrawRange(0, seg * 2);
    }
  });

  return (
    <>
      {/* Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos,   3]} />
          <bufferAttribute attach="attributes-aAlpha"   args={[lineAlpha, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={LINE_VERT}
          fragmentShader={LINE_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos,   3]} />
          <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={nodeMatRef}
          vertexShader={NODE_VERT}
          fragmentShader={NODE_FRAG}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// ─── Glow Orb — large blob on the RIGHT ──────────────────────────────────────
const ORB_VERT = /* glsl */`
  uniform float uTime;
  varying vec3  vNormal;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(mix(hash(i),           hash(i+vec3(1,0,0)), f.x),
          mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
          mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  void main() {
    vNormal    = normalize(normalMatrix * normal);
    vec3 pos   = position;
    float n    = noise(pos * 2.0 + uTime * 0.22) - 0.5;
    pos       += normal * n * 0.28;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const ORB_FRAG = /* glsl */`
  uniform float uTime;
  varying vec3  vNormal;
  void main() {
    float fr    = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 1.5);
    vec3 inner  = vec3(0.0, 0.7, 1.0);
    vec3 edge   = vec3(0.35, 0.98, 1.0);
    vec3 col    = mix(inner * 0.55, edge, fr);
    col        *= 0.82 + 0.18 * sin(uTime * 2.0);
    gl_FragColor = vec4(col, 0.5 + fr * 0.45);
  }
`;

function GlowOrb({ mouseRef }: { mouseRef: MouseRef }) {
  const meshRef   = useRef<THREE.Mesh>(null!);
  const matRef    = useRef<THREE.ShaderMaterial>(null!);
  const tgt       = useRef({ x: 4.8, y: 0.3 });
  const { viewport } = useThree();

  useFrame(({ clock }, delta) => {
    const t  = clock.getElapsedTime();
    const mx = (mouseRef.current.x / (window.innerWidth  || 1) - 0.5);
    const my = -(mouseRef.current.y / (window.innerHeight || 1) - 0.5);
    const lf = 1 - Math.pow(0.018, delta);

    tgt.current.x += (4.8 + mx * viewport.width  * 0.18 - tgt.current.x) * lf;
    tgt.current.y += (0.3 + my * viewport.height * 0.14 - tgt.current.y) * lf;
    meshRef.current.position.x += (tgt.current.x - meshRef.current.position.x) * lf;
    meshRef.current.position.y += (tgt.current.y - meshRef.current.position.y) * lf;
    meshRef.current.rotation.y += delta * 0.09;
    meshRef.current.rotation.z += delta * 0.05;
    matRef.current.uniforms.uTime.value = t;
  });

  return (
    <group>
      <mesh ref={meshRef} position={[4.8, 0.3, 0]}>
        <sphereGeometry args={[1.4, 96, 96]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={ORB_VERT}
          fragmentShader={ORB_FRAG}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* Outer atmosphere */}
      <mesh position={[4.8, 0.3, -0.3]}>
        <sphereGeometry args={[1.9, 24, 24]} />
        <meshBasicMaterial color="#00BBFF" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Fine wireframe */}
      <mesh position={[4.8, 0.3, 0]}>
        <sphereGeometry args={[1.42, 14, 14]} />
        <meshBasicMaterial color="#00D4FF" wireframe transparent opacity={0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Holographic Torus — glass blue on the LEFT ───────────────────────────────
const TOR_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vNormal     = normalize(normalMatrix * normal);
    vPos        = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const TOR_FRAG = /* glsl */`
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    float fr     = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.0);
    vec3 deep    = vec3(0.0, 0.18, 0.65);
    vec3 bright  = vec3(0.22, 0.72, 1.0);
    vec3 col     = mix(deep, bright, fr);
    float shimmer = sin(vPos.x * 9.0 + vPos.y * 4.5 + uTime * 2.8) * 0.5 + 0.5;
    col          = mix(col, vec3(0.55, 0.92, 1.0), shimmer * 0.28 * fr);
    col         *= 0.8 + 0.2 * sin(uTime * 2.2);
    gl_FragColor  = vec4(col, 0.42 + fr * 0.52);
  }
`;

function HoloTorus({ mouseRef }: { mouseRef: MouseRef }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<THREE.ShaderMaterial>(null!);
  const tgt     = useRef({ x: -4.8, y: -0.35 });
  const { viewport } = useThree();

  useFrame(({ clock }, delta) => {
    const t  = clock.getElapsedTime();
    const mx = (mouseRef.current.x / (window.innerWidth  || 1) - 0.5);
    const my = -(mouseRef.current.y / (window.innerHeight || 1) - 0.5);
    const lf = 1 - Math.pow(0.018, delta);

    tgt.current.x += (-4.8 - mx * viewport.width  * 0.18 - tgt.current.x) * lf;
    tgt.current.y += (-0.35 - my * viewport.height * 0.12 - tgt.current.y) * lf;
    meshRef.current.position.x += (tgt.current.x - meshRef.current.position.x) * lf;
    meshRef.current.position.y += (tgt.current.y - meshRef.current.position.y) * lf;
    meshRef.current.rotation.x += delta * 0.24;
    meshRef.current.rotation.y += delta * 0.17;
    meshRef.current.rotation.z += delta * 0.08;
    matRef.current.uniforms.uTime.value = t;
  });

  return (
    <mesh ref={meshRef} position={[-4.8, -0.35, -0.5]}>
      <torusGeometry args={[1.15, 0.38, 28, 120]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={TOR_VERT}
        fragmentShader={TOR_FRAG}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Accent Orb — planet/sun style ───────────────────────────────────────────
function AccentOrb({
  ox, oy, oz, radius, color, emissive, speed, mouseRef,
}: {
  ox: number; oy: number; oz: number;
  radius: number; color: string; emissive: string; speed: number;
  mouseRef: MouseRef;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  useFrame(({ clock }, delta) => {
    const t  = clock.getElapsedTime();
    const mx = (mouseRef.current.x / (window.innerWidth  || 1) - 0.5);
    const my = -(mouseRef.current.y / (window.innerHeight || 1) - 0.5);
    const lf = 1 - Math.pow(0.012, delta);

    const tx = ox + mx * viewport.width  * 0.1;
    const ty = oy + my * viewport.height * 0.08 + Math.sin(t * speed + ox) * 0.28;
    ref.current.position.x += (tx - ref.current.position.x) * lf;
    ref.current.position.y += (ty - ref.current.position.y) * lf;
    ref.current.position.z  = oz;

    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.8 + 1.4 * Math.sin(t * 2.0 + ox);
  });

  return (
    <mesh ref={ref} position={[ox, oy, oz]}>
      <sphereGeometry args={[radius, 28, 28]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={2.2}
        roughness={0.25}
        metalness={0.55}
      />
    </mesh>
  );
}

// ─── Root scene ───────────────────────────────────────────────────────────────
export default function HeroScene({ mouseRef }: { mouseRef: MouseRef }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0,   0,  8]}  color="#00D4FF" intensity={1.8} distance={35} decay={2} />
      <pointLight position={[-5,  3,  0]}  color="#0055FF" intensity={0.9} distance={25} decay={2} />
      <pointLight position={[5,  -2,  0]}  color="#003388" intensity={0.5} distance={20} decay={2} />

      {/* White particle web */}
      <ParticleNetwork mouseRef={mouseRef} />

      {/* Procedural lightning */}
      <LightningSystem />

      {/* Large cyan blob — pushed to RIGHT edge, away from text */}
      <GlowOrb mouseRef={mouseRef} />

      {/* Holographic torus — pushed to LEFT edge, away from text */}
      <HoloTorus mouseRef={mouseRef} />

      {/* Deep blue sphere — bottom right corner */}
      <AccentOrb ox={5.0}  oy={-2.8} oz={-1.5} radius={0.42} color="#0044BB" emissive="#0033CC" speed={0.7}  mouseRef={mouseRef} />

      {/* Orange-red orb — bottom left corner */}
      <AccentOrb ox={-4.8} oy={-2.6} oz={-1.2} radius={0.32} color="#CC3300" emissive="#FF4400" speed={0.95} mouseRef={mouseRef} />

      {/* Small accent — top left */}
      <AccentOrb ox={-5.2} oy={2.4}  oz={-2.2} radius={0.20} color="#0088FF" emissive="#0066FF" speed={1.1}  mouseRef={mouseRef} />

      {/* Small accent — top right */}
      <AccentOrb ox={5.2}  oy={2.2}  oz={-2.5} radius={0.16} color="#00AAFF" emissive="#0055FF" speed={0.65} mouseRef={mouseRef} />
    </>
  );
}
