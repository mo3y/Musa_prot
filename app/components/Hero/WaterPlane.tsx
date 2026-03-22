'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation =
      sin(modelPosition.x * uFrequency + uTime * 1.2) * 0.5 * uAmplitude +
      sin(modelPosition.z * uFrequency * 0.7 + uTime * 0.9) * 0.3 * uAmplitude +
      sin(modelPosition.x * uFrequency * 2.1 + modelPosition.z * uFrequency * 1.3 + uTime * 1.5) * 0.2 * uAmplitude;

    modelPosition.y += elevation;
    vElevation = elevation;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uDepthColor;
  uniform vec3 uSurfaceColor;
  uniform float uColorOffset;
  uniform float uColorMultiplier;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Edge fade
    float edgeFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
    edgeFade *= edgeFade;

    gl_FragColor = vec4(color, 0.6 * edgeFade);
  }
`;

export default function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3.5, 0, 0]} position={[0, -3.5, -1]}>
      <planeGeometry args={[20, 8, 128, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uFrequency: { value: 2.5 },
          uAmplitude: { value: 0.3 },
          uDepthColor: { value: new THREE.Color('#001a33') },
          uSurfaceColor: { value: new THREE.Color('#00D4FF') },
          uColorOffset: { value: 0.15 },
          uColorMultiplier: { value: 3.0 },
        }}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
