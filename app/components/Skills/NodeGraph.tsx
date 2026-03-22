'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface SkillNode {
  id: string;
  label: string;
  color: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  tilt: number;
  tools: string[];
}

const SKILL_NODES: SkillNode[] = [
  {
    id: 'security',
    label: 'CYBERSECURITY',
    color: '#00D4FF',
    radius: 0.45,
    orbitRadius: 0,
    orbitSpeed: 0,
    orbitOffset: 0,
    tilt: 0,
    tools: ['Metasploit', 'Burp Suite', 'Wireshark', 'Nmap', 'OWASP', 'CTF'],
  },
  {
    id: 'ai',
    label: 'AI / ML',
    color: '#0055FF',
    radius: 0.35,
    orbitRadius: 2.8,
    orbitSpeed: 0.4,
    orbitOffset: 0,
    tilt: 0.3,
    tools: ['PyTorch', 'TensorFlow', 'Transformers', 'LangChain', 'OpenAI API', 'scikit-learn'],
  },
  {
    id: 'python',
    label: 'PYTHON',
    color: '#00D4FF',
    radius: 0.3,
    orbitRadius: 2.2,
    orbitSpeed: 0.7,
    orbitOffset: Math.PI / 3,
    tilt: -0.2,
    tools: ['FastAPI', 'Django', 'asyncio', 'Pandas', 'NumPy', 'Scrapy'],
  },
  {
    id: 'backend',
    label: 'BACKEND',
    color: '#00aacc',
    radius: 0.32,
    orbitRadius: 3.2,
    orbitSpeed: 0.35,
    orbitOffset: Math.PI,
    tilt: 0.5,
    tools: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'REST', 'GraphQL'],
  },
  {
    id: 'fullstack',
    label: 'FULL-STACK',
    color: '#0055FF',
    radius: 0.28,
    orbitRadius: 2.5,
    orbitSpeed: 0.55,
    orbitOffset: Math.PI / 1.5,
    tilt: -0.4,
    tools: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Prisma', 'tRPC'],
  },
  {
    id: 'automation',
    label: 'AUTOMATION',
    color: '#00D4FF',
    radius: 0.27,
    orbitRadius: 3.5,
    orbitSpeed: 0.3,
    orbitOffset: Math.PI * 1.3,
    tilt: 0.25,
    tools: ['Bash', 'Ansible', 'Selenium', 'GitHub Actions', 'Cron', 'Webhooks'],
  },
  {
    id: 'linux',
    label: 'LINUX',
    color: '#4A7A8A',
    radius: 0.26,
    orbitRadius: 2.0,
    orbitSpeed: 0.8,
    orbitOffset: Math.PI * 0.7,
    tilt: -0.6,
    tools: ['Kali', 'Ubuntu', 'Arch', 'systemd', 'iptables', 'tmux'],
  },
  {
    id: 'networking',
    label: 'NETWORKING',
    color: '#0044cc',
    radius: 0.28,
    orbitRadius: 3.0,
    orbitSpeed: 0.45,
    orbitOffset: Math.PI * 1.7,
    tilt: 0.7,
    tools: ['TCP/IP', 'DNS', 'TLS/SSL', 'Firewall', 'VPN', 'Packet Analysis'],
  },
];

function ConnectionLines({ positions }: { positions: Map<string, THREE.Vector3> }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { geometry } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const center = positions.get('security') || new THREE.Vector3();

    SKILL_NODES.filter((n) => n.id !== 'security').forEach((node) => {
      const pos = positions.get(node.id);
      if (pos) {
        points.push(center.clone(), pos.clone());
      }
    });

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return { geometry: geo };
  }, [positions]);

  useFrame(() => {
    if (!lineRef.current) return;
    const posArray: number[] = [];
    const center = positions.get('security') || new THREE.Vector3();

    SKILL_NODES.filter((n) => n.id !== 'security').forEach((node) => {
      const pos = positions.get(node.id);
      if (pos) {
        posArray.push(center.x, center.y, center.z);
        posArray.push(pos.x, pos.y, pos.z);
      }
    });

    lineRef.current.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(posArray, 3)
    );
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color="#00D4FF"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function SkillNodeMesh({
  node,
  isSelected,
  isHovered,
  onClick,
  onHover,
  posRef,
  nodeIndex,
}: {
  node: SkillNode;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (h: boolean) => void;
  posRef: { current: THREE.Vector3 };
  nodeIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.MeshStandardMaterial>(null);

  // Staggered idle pulse period: every 3-5s, different per node
  const pulsePhase  = nodeIndex * 0.9;   // stagger start
  const pulsePeriod = 3.5 + nodeIndex * 0.4; // each node pulses at slightly different rate

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Staggered idle pulse: emissive spikes on its own schedule
    if (matRef.current && !isSelected && !isHovered) {
      // sawtooth reset every pulsePeriod, smooth bell curve at peak
      const cycleT = ((t + pulsePhase) % pulsePeriod) / pulsePeriod;
      const bell = Math.exp(-Math.pow((cycleT - 0.15) * 10, 2)); // sharp peak at 15% of cycle
      matRef.current.emissiveIntensity = 0.5 + bell * 1.8;
    } else if (matRef.current) {
      matRef.current.emissiveIntensity = isSelected ? 2.2 : 1.4;
    }

    if (node.orbitRadius === 0) {
      if (meshRef.current) {
        meshRef.current.rotation.y = t * 0.3;
        meshRef.current.rotation.x = t * 0.15;
        meshRef.current.rotation.z = t * 0.08;
        posRef.current.set(0, 0, 0);
      }
      return;
    }

    const angle = t * node.orbitSpeed + node.orbitOffset;
    const x = Math.cos(angle) * node.orbitRadius;
    const y = Math.sin(angle * 0.7) * node.tilt * node.orbitRadius * 0.3;
    const z = Math.sin(angle) * node.orbitRadius * 0.4;

    if (meshRef.current) {
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.y = t * 0.8;
      meshRef.current.rotation.x = t * 0.4;
      posRef.current.set(x, y, z);
    }
    if (glowRef.current) {
      glowRef.current.position.set(x, y, z);
      const pulse = 1 + 0.2 * Math.sin(t * 2.5 + node.orbitOffset);
      glowRef.current.scale.setScalar((isSelected || isHovered ? 2.4 : 1.6) * pulse);
    }
  });

  const scale = isSelected ? 1.65 : isHovered ? 1.35 : 1;

  return (
    <group>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[node.radius * 1.5, 16, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isSelected || isHovered ? 0.2 : 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Main node */}
      <mesh
        ref={meshRef}
        scale={scale}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
      >
        <icosahedronGeometry args={[node.radius, 1]} />
        <meshStandardMaterial
          ref={matRef}
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

export default function NodeGraph({ onNodeSelect }: { onNodeSelect: (node: SkillNode | null) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const posRefs = useRef(new Map<string, { current: THREE.Vector3 }>());
  const positions = useRef(new Map<string, THREE.Vector3>());

  // Initialize position refs
  SKILL_NODES.forEach((node) => {
    if (!posRefs.current.has(node.id)) {
      const ref = { current: new THREE.Vector3() };
      posRefs.current.set(node.id, ref);
    }
  });

  useFrame(() => {
    posRefs.current.forEach((ref, id) => {
      positions.current.set(id, ref.current.clone());
    });
  });

  const handleClick = (node: SkillNode) => {
    const newSelected = selected === node.id ? null : node.id;
    setSelected(newSelected);
    onNodeSelect(newSelected ? node : null);
  };

  return (
    <group>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#00D4FF" />
      <pointLight position={[-5, 3, 0]} intensity={1} color="#0055FF" />

      <ConnectionLines positions={positions.current} />

      {SKILL_NODES.map((node, i) => {
        const posRef = posRefs.current.get(node.id)!;
        return (
          <SkillNodeMesh
            key={node.id}
            node={node}
            nodeIndex={i}
            isSelected={selected === node.id}
            isHovered={hovered === node.id}
            onClick={() => handleClick(node)}
            onHover={(h) => setHovered(h ? node.id : null)}
            posRef={posRef}
          />
        );
      })}
    </group>
  );
}

export { SKILL_NODES };
export type { SkillNode };
