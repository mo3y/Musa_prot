'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.35;
      ring2Ref.current.rotation.z = t * 0.15;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -t * 0.4;
      ring3Ref.current.rotation.y = t * 0.2;
    }
  });

  const ringColors = ['#00D4FF', '#0055FF', '#00D4FF'];
  const ringRadii: [number, number, number, number, number][] = [
    [1.6, 0.04, 3, 1, 64],
    [2.2, 0.03, 3, 1, 64],
    [2.8, 0.025, 3, 1, 64],
  ];
  const ringRefs = [ring1Ref, ring2Ref, ring3Ref];

  return (
    <group ref={groupRef}>
      {/* Central sphere */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.9}
          wireframe={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Orbital rings */}
      {ringRefs.map((ref, i) => (
        <mesh
          key={i}
          ref={ref}
          rotation={[
            i === 0 ? Math.PI / 2 : i === 1 ? Math.PI / 3 : Math.PI / 6,
            i * 0.8,
            0,
          ]}
        >
          <torusGeometry args={ringRadii[i]} />
          <meshStandardMaterial
            color={ringColors[i]}
            emissive={ringColors[i]}
            emissiveIntensity={1.5}
            roughness={0}
            metalness={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Orbiting particles */}
      {[0, 1.2, 2.4, 3.6, 4.8, 6.0].map((offset, i) => (
        <OrbitingParticle key={i} radius={1.6 + (i % 3) * 0.6} speed={0.5 + i * 0.15} offset={offset} />
      ))}

      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#00D4FF" />
      <pointLight position={[-3, -3, 3]} intensity={1} color="#0055FF" />
    </group>
  );
}

function OrbitingParticle({ radius, speed, offset }: { radius: number; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.y = Math.sin(t) * radius * 0.3;
      ref.current.position.z = Math.sin(t) * radius * 0.8;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial
        color="#00D4FF"
        emissive="#00D4FF"
        emissiveIntensity={3}
        roughness={0}
      />
    </mesh>
  );
}
