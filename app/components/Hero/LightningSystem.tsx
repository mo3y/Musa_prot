'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function generateLightningPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  segments: number,
  displacement: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [start.clone()];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const point = start.clone().lerp(end, t);
    point.x += (Math.random() - 0.5) * displacement;
    point.y += (Math.random() - 0.5) * displacement;
    point.z += (Math.random() - 0.5) * displacement * 0.3;
    points.push(point);
  }
  points.push(end.clone());
  return points;
}

interface LightningBolt {
  lines: THREE.Line[];
  geometries: THREE.BufferGeometry[];
  lifetime: number;
  maxLifetime: number;
  glowMesh: THREE.Mesh;
}

export default function LightningSystem() {
  const groupRef = useRef<THREE.Group>(null);
  const boltsRef = useRef<LightningBolt[]>([]);
  const nextBoltRef = useRef(1.5);
  const timeRef = useRef(0);

  function spawnBolt() {
    const group = groupRef.current;
    if (!group) return;

    // Dispatch screen flash event for Hero overlay
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lightning-strike'));
    }

    const startX = (Math.random() - 0.5) * 14;
    const startY = (Math.random() - 0.5) * 7 + 1.5;
    const endX = startX + (Math.random() - 0.5) * 10;
    const endY = startY + (Math.random() - 0.5) * 5 - 2;
    const depth = (Math.random() - 0.5) * 3;

    const start = new THREE.Vector3(startX, startY, depth);
    const end = new THREE.Vector3(endX, endY, depth);
    const points = generateLightningPoints(start, end, 28, 1.0);

    const lines: THREE.Line[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    // Main trunk — bright white-cyan
    const trunkGeo = new THREE.BufferGeometry().setFromPoints(points);
    const trunkMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#F0FAFF'),
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      linewidth: 1,
    });
    const trunk = new THREE.Line(trunkGeo, trunkMat);
    group.add(trunk);
    lines.push(trunk);
    geometries.push(trunkGeo);

    // 6-8 branches radiating off the main trunk
    const branchCount = 5 + Math.floor(Math.random() * 4);
    for (let b = 0; b < branchCount; b++) {
      const srcIdx = 3 + Math.floor(Math.random() * (points.length - 6));
      const branchStart = points[srcIdx];
      const branchLen = 1.5 + Math.random() * 3;
      const branchAngle = Math.random() * Math.PI * 2;
      const branchEnd = new THREE.Vector3(
        branchStart.x + Math.cos(branchAngle) * branchLen,
        branchStart.y + Math.sin(branchAngle) * branchLen * 0.6,
        branchStart.z
      );
      const bPoints = generateLightningPoints(branchStart, branchEnd, 10 + b, 0.5);
      const bGeo = new THREE.BufferGeometry().setFromPoints(bPoints);
      const bMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(b % 2 === 0 ? '#00D4FF' : '#FFFFFF'),
        transparent: true,
        opacity: 0.55 + Math.random() * 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const branch = new THREE.Line(bGeo, bMat);
      group.add(branch);
      lines.push(branch);
      geometries.push(bGeo);

      // Sub-branches
      if (Math.random() > 0.4) {
        const subIdx = 2 + Math.floor(Math.random() * (bPoints.length - 3));
        const subStart = bPoints[subIdx];
        const subEnd = new THREE.Vector3(
          subStart.x + (Math.random() - 0.5) * 2,
          subStart.y + (Math.random() - 0.5) * 1.5,
          subStart.z
        );
        const sPoints = generateLightningPoints(subStart, subEnd, 6, 0.3);
        const sGeo = new THREE.BufferGeometry().setFromPoints(sPoints);
        const sMat = new THREE.LineBasicMaterial({
          color: new THREE.Color('#00D4FF'),
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sub = new THREE.Line(sGeo, sMat);
        group.add(sub);
        lines.push(sub);
        geometries.push(sGeo);
      }
    }

    // Volumetric glow sphere at strike midpoint — fades over 1s
    const midpoint = start.clone().lerp(end, 0.5);
    const glowGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00D4FF'),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.copy(midpoint);
    group.add(glowMesh);

    const bolt: LightningBolt = {
      lines,
      geometries,
      lifetime: 0,
      maxLifetime: 0.12 + Math.random() * 0.18,
      glowMesh,
    };
    boltsRef.current.push(bolt);
  }

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (timeRef.current > nextBoltRef.current) {
      spawnBolt();
      // Occasionally double-strike
      if (Math.random() > 0.6) {
        setTimeout(() => spawnBolt(), 80);
      }
      nextBoltRef.current = timeRef.current + 1.0 + Math.random() * 1.5;
    }

    boltsRef.current = boltsRef.current.filter((bolt) => {
      bolt.lifetime += delta;
      const t = bolt.lifetime / bolt.maxLifetime;

      // Main bolt fade: fast flash then slow glow decay
      const boltAlpha = Math.max(0, 1 - t * t * 2) * 1.0;
      bolt.lines.forEach((line) => {
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity = boltAlpha * (line === bolt.lines[0] ? 1.0 : 0.6);
      });

      // Glow fades slower (over ~1s regardless of bolt lifetime)
      const glowT = Math.min(bolt.lifetime / 1.0, 1.0);
      const glowMat = bolt.glowMesh.material as THREE.MeshBasicMaterial;
      glowMat.opacity = 0.18 * (1.0 - glowT * glowT);
      bolt.glowMesh.scale.setScalar(1.0 + glowT * 2.0);

      if (bolt.lifetime >= 1.2) {
        bolt.lines.forEach((l) => groupRef.current?.remove(l));
        bolt.geometries.forEach((g) => g.dispose());
        groupRef.current?.remove(bolt.glowMesh);
        glowMat.dispose();
        return false;
      }
      return true;
    });
  });

  return <group ref={groupRef} />;
}
