'use client';

import { useRef, useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Planet Configuration ────────────────────────────────────────────────────

interface PlanetConfig {
  id: string;
  orbitRadius: number;
  size: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  speed: number;
  tilt: number;
  offset: number;
  roughness: number;
  metalness: number;
}

const PLANET_CONFIGS: PlanetConfig[] = [
  { id: 'mercury', orbitRadius: 2.2, size: 0.13, color: '#9A8870', emissive: '#5A4830', emissiveIntensity: 0.2, speed: 1.6, tilt: 0.10, offset: 0.0, roughness: 0.95, metalness: 0.1 },
  { id: 'venus',   orbitRadius: 3.2, size: 0.23, color: '#E8C870', emissive: '#C08820', emissiveIntensity: 0.3, speed: 1.1, tilt: 0.08, offset: 1.1, roughness: 0.85, metalness: 0.0 },
  { id: 'earth',   orbitRadius: 4.2, size: 0.26, color: '#2255CC', emissive: '#112288', emissiveIntensity: 0.2, speed: 0.8, tilt: 0.15, offset: 2.2, roughness: 0.7,  metalness: 0.1 },
  { id: 'mars',    orbitRadius: 5.3, size: 0.19, color: '#CC4422', emissive: '#881100', emissiveIntensity: 0.25, speed: 0.6, tilt: 0.25, offset: 3.3, roughness: 0.9,  metalness: 0.05 },
  { id: 'jupiter', orbitRadius: 6.8, size: 0.52, color: '#C8A870', emissive: '#885520', emissiveIntensity: 0.15, speed: 0.35, tilt: 0.05, offset: 4.4, roughness: 0.8, metalness: 0.0 },
  { id: 'saturn',  orbitRadius: 8.2, size: 0.42, color: '#E0CC90', emissive: '#A08840', emissiveIntensity: 0.15, speed: 0.22, tilt: 0.35, offset: 5.5, roughness: 0.8, metalness: 0.0 },
];

// ─── Nebula Background ────────────────────────────────────────────────────────

const NEBULA_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAG = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;

  // Simplex-style hash noise
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec2(1.3, 0.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= 2.0;

    float t = uTime * 0.04;

    // Deep space base
    vec3 col = vec3(0.005, 0.008, 0.018);

    // Nebula cloud 1 — blue/purple
    float n1 = fbm(uv * 2.5 + t);
    float n2 = fbm(uv * 3.0 - t * 0.7 + 1.3);
    float cloud1 = smoothstep(0.4, 0.75, n1 * n2 * 2.5);
    col += vec3(0.04, 0.06, 0.22) * cloud1 * 0.9;

    // Nebula cloud 2 — teal accent
    float n3 = fbm(uv * 4.0 + vec2(2.1, 1.7) + t * 0.5);
    float cloud2 = smoothstep(0.5, 0.8, n3 * 1.8);
    col += vec3(0.0, 0.12, 0.18) * cloud2 * 0.6;

    // Purple wisps
    float n4 = fbm(uv * 1.8 + vec2(-1.5, 0.8) - t * 0.3);
    float wisp = smoothstep(0.45, 0.7, n4 * 2.0);
    col += vec3(0.08, 0.02, 0.15) * wisp * 0.7;

    // Warm core glow (towards center-left where sun is)
    float coreDist = length(uv - vec2(-0.15, 0.0));
    float coreGlow = smoothstep(0.6, 0.0, coreDist) * 0.35;
    col += vec3(0.12, 0.06, 0.01) * coreGlow;

    // Vignette
    float vig = smoothstep(0.9, 0.3, length(uv * 0.8));
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function NebulaBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 0, -25]} scale={[80, 50, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={NEBULA_VERT}
        fragmentShader={NEBULA_FRAG}
        uniforms={{ uTime: { value: 0 } }}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ─── Star Field ──────────────────────────────────────────────────────────────

const STAR_VERT = /* glsl */`
  attribute float seed;
  attribute float size;
  uniform float uTime;
  varying float vAlpha;
  varying float vSize;

  void main() {
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + seed * 2.0) + seed * 6.2831);
    vAlpha = twinkle;
    vSize = size;
    gl_PointSize = size * (0.7 + 0.3 * twinkle);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const STAR_FRAG = /* glsl */`
  varying float vAlpha;
  varying float vSize;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft glow falloff
    float core = smoothstep(0.5, 0.0, d);
    float glow = smoothstep(0.5, 0.1, d) * 0.4;

    // Color: slight blue tint for distant stars, white for bright
    vec3 starColor = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.98, 0.92), core);

    float alpha = (core + glow) * vAlpha;
    gl_FragColor = vec4(starColor, alpha);
  }
`;

function StarField() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, seeds, sizes } = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const sd = new Float32Array(count);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 20 + Math.random() * 20;
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i * 3 + 2] = -8 - Math.random() * 18;
      sd[i] = Math.random();
      // varied sizes: mostly small, a few bright ones
      sz[i] = Math.random() < 0.05 ? 3.5 + Math.random() * 2 : 1.0 + Math.random() * 1.5;
    }
    return { positions: pos, seeds: sd, sizes: sz };
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-seed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Shooting Stars ──────────────────────────────────────────────────────────

const TRAIL_LENGTH = 8;
const TRAIL_SPACING = 0.28;
const SHOOTING_SPEED = 10;
const SCENE_BOUND = 22;

function makeRandomDirection(): THREE.Vector3 {
  const angle = -Math.PI * 0.25 + (Math.random() - 0.5) * 0.8;
  const pitch = (Math.random() - 0.5) * 0.2;
  return new THREE.Vector3(Math.cos(angle), pitch, Math.sin(angle) * 0.2).normalize();
}

function makeRandomStartPos(): THREE.Vector3 {
  return new THREE.Vector3(
    -SCENE_BOUND + Math.random() * 8,
    4 + Math.random() * 6,
    (Math.random() - 0.5) * 4,
  );
}

interface ShootingStarState {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  active: boolean;
  nextFire: number;
}

function ShootingStar({ staggerDelay }: { staggerDelay: number }) {
  const posAttr = useRef<THREE.BufferAttribute>(null!);
  const state = useRef<ShootingStarState>({
    position: makeRandomStartPos(),
    direction: makeRandomDirection(),
    active: false,
    nextFire: staggerDelay,
  });

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(TRAIL_LENGTH * 3);
    const col = new Float32Array(TRAIL_LENGTH * 3);
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const alpha = Math.pow(1 - i / (TRAIL_LENGTH - 1), 1.5);
      // Head: bright white-blue, tail: faded cyan
      col[i * 3 + 0] = 0.8 + 0.2 * alpha;
      col[i * 3 + 1] = 0.9 + 0.1 * alpha;
      col[i * 3 + 2] = 1.0;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }, delta) => {
    const s = state.current;
    const t = clock.getElapsedTime();

    if (!s.active) {
      if (t >= s.nextFire) {
        s.active = true;
        s.position = makeRandomStartPos();
        s.direction = makeRandomDirection();
      } else {
        if (posAttr.current) {
          (posAttr.current.array as Float32Array).fill(0);
          posAttr.current.needsUpdate = true;
        }
        return;
      }
    }

    s.position.addScaledVector(s.direction, delta * SHOOTING_SPEED);

    const outOfBounds = s.position.x > SCENE_BOUND || Math.abs(s.position.y) > 16;
    if (outOfBounds) {
      s.active = false;
      s.nextFire = t + 2 + Math.random() * 2.5;
      if (posAttr.current) {
        (posAttr.current.array as Float32Array).fill(0);
        posAttr.current.needsUpdate = true;
      }
      return;
    }

    if (posAttr.current) {
      const arr = posAttr.current.array as Float32Array;
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        arr[i * 3 + 0] = s.position.x - s.direction.x * i * TRAIL_SPACING;
        arr[i * 3 + 1] = s.position.y - s.direction.y * i * TRAIL_SPACING;
        arr[i * 3 + 2] = s.position.z - s.direction.z * i * TRAIL_SPACING;
      }
      posAttr.current.needsUpdate = true;
    }
  });

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        linewidth={2}
      />
    </line>
  );
}

// ─── Earth Shader (procedural continents) ────────────────────────────────────

const EARTH_VERT = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAG = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float uTime;

  float hash(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(p.x * p.y * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
          mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
          mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3(p);
      p = p * 2.1 + vec3(1.3, 0.7, 0.9);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = vPos * 3.5 + vec3(uTime * 0.02, 0.0, 0.0);
    float land = fbm3(p);

    // Ocean: deep blue
    vec3 oceanColor = vec3(0.05, 0.18, 0.48);
    // Land: green + brown mix
    vec3 landColor = mix(vec3(0.08, 0.25, 0.06), vec3(0.35, 0.22, 0.08), smoothstep(0.52, 0.65, land));
    // Ice caps (polar)
    float pole = abs(vNormal.y);
    vec3 iceColor = vec3(0.85, 0.92, 1.0);

    vec3 surface = mix(oceanColor, landColor, smoothstep(0.48, 0.55, land));
    surface = mix(surface, iceColor, smoothstep(0.7, 0.9, pole));

    // Clouds
    float cloud = fbm3(vPos * 5.0 + vec3(uTime * 0.05, 0.0, 0.0));
    surface = mix(surface, vec3(0.9, 0.95, 1.0), smoothstep(0.58, 0.7, cloud) * 0.6);

    // Basic lighting from sun direction
    vec3 sunDir = normalize(vec3(-1.5, 0.5, 2.0));
    float diff = max(dot(vNormal, sunDir), 0.0) * 0.8 + 0.2;

    // Atmosphere rim
    float rim = pow(1.0 - max(dot(vNormal, normalize(vec3(0.0, 0.0, 1.0))), 0.0), 3.0);
    vec3 atmosphere = vec3(0.1, 0.4, 0.9) * rim * 0.5;

    gl_FragColor = vec4(surface * diff + atmosphere, 1.0);
  }
`;

function EarthMesh({ size, meshRef }: { size: number; meshRef: RefObject<THREE.Mesh | null> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={EARTH_VERT}
        fragmentShader={EARTH_FRAG}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  );
}

// ─── Planet ──────────────────────────────────────────────────────────────────

function Planet({ config }: { config: PlanetConfig }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const isSaturn = config.id === 'saturn';
  const isEarth = config.id === 'earth';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = t * config.speed + config.offset;
    const x = Math.cos(angle) * config.orbitRadius;
    const y = Math.sin(angle) * config.tilt;
    const z = Math.sin(angle) * config.orbitRadius * 0.25;
    if (meshRef.current) {
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      {/* Orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[config.orbitRadius, 0.007, 3, 160]} />
        <meshBasicMaterial color="#88BBCC" transparent opacity={0.07} />
      </mesh>

      {isEarth ? (
        <EarthMesh size={config.size} meshRef={meshRef} />
      ) : (
        <mesh ref={meshRef}>
          <sphereGeometry args={[config.size, 40, 40]} />
          <meshStandardMaterial
            color={config.color}
            emissive={config.emissive}
            emissiveIntensity={config.emissiveIntensity}
            roughness={config.roughness}
            metalness={config.metalness}
          />

          {isSaturn && (
            <>
              {/* Main ring */}
              <mesh rotation={[Math.PI / 2.6, 0, 0]}>
                <torusGeometry args={[0.65, 0.15, 2, 80]} />
                <meshBasicMaterial color="#D4B870" transparent opacity={0.45} side={THREE.DoubleSide} />
              </mesh>
              {/* Outer ring */}
              <mesh rotation={[Math.PI / 2.6, 0, 0]}>
                <torusGeometry args={[0.85, 0.06, 2, 80]} />
                <meshBasicMaterial color="#B89A50" transparent opacity={0.25} side={THREE.DoubleSide} />
              </mesh>
            </>
          )}
        </mesh>
      )}
    </>
  );
}

// ─── Sun ─────────────────────────────────────────────────────────────────────

const CORONA_VERT = /* glsl */`
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CORONA_FRAG = /* glsl */`
  varying vec3 vNormal;
  uniform float uTime;

  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.8);
    vec3 color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.9, 0.3), rim);
    gl_FragColor = vec4(color * pulse, rim * 0.6);
  }
`;

function Sun() {
  const coronaRef = useRef<THREE.ShaderMaterial>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coronaRef.current) coronaRef.current.uniforms.uTime.value = t;
    if (coreRef.current) {
      const pulse = 1 + 0.015 * Math.sin(t * 2.1);
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.95, 64, 64]} />
        <meshStandardMaterial
          color="#FFE060"
          emissive="#FFB020"
          emissiveIntensity={5}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Corona rim shader */}
      <mesh>
        <sphereGeometry args={[1.25, 32, 32]} />
        <shaderMaterial
          ref={coronaRef}
          vertexShader={CORONA_VERT}
          fragmentShader={CORONA_FRAG}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Warm glow halos */}
      {[1.6, 2.2, 3.2].map((r, i) => (
        <mesh key={i}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshBasicMaterial
            color={i === 0 ? '#FF9020' : i === 1 ? '#FF6000' : '#FF3000'}
            transparent
            opacity={i === 0 ? 0.09 : i === 1 ? 0.05 : 0.025}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Lens flare sprite (simple bright center point) */}
      <mesh position={[0, 0, 0.5]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight position={[0, 0, 0]} color="#FFB340" intensity={4} distance={40} decay={2} />
      <pointLight position={[0, 0, 0]} color="#FF6000" intensity={1.5} distance={60} decay={1.5} />
    </group>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function SolarSystem() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.018 * delta;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.06} />

      <NebulaBackground />
      <StarField />
      <Sun />

      {PLANET_CONFIGS.map((cfg) => (
        <Planet key={cfg.id} config={cfg} />
      ))}

      {/* 5 shooting stars with varied delays for constant stream */}
      <ShootingStar staggerDelay={0.3} />
      <ShootingStar staggerDelay={1.8} />
      <ShootingStar staggerDelay={3.2} />
      <ShootingStar staggerDelay={4.7} />
      <ShootingStar staggerDelay={6.1} />
    </group>
  );
}
