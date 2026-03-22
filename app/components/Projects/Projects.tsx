'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  type: string;
  status: string;
  github: string;
  featured?: boolean;
  color: string;
}

const PROJECTS: Project[] = [
  {
    id: 'linux-vm-lab',
    name: 'Linux VM Security Lab',
    tagline: 'Virtualized Security Environment on VMware',
    description:
      'Built and managed a multi-VM Linux lab using VMware Workstation. Configured isolated network segments, deployed Kali Linux and Ubuntu VMs, set up SSH tunneling, practiced privilege escalation techniques, and simulated real attack-defense scenarios in a controlled environment.',
    tech: ['VMware', 'Kali Linux', 'Ubuntu', 'Networking', 'SSH', 'Bash'],
    type: 'Infrastructure',
    status: 'Running',
    github: 'https://github.com/Atoky5',
    featured: true,
    color: '#00D4FF',
  },
  {
    id: 'maltego-osint',
    name: 'OSINT Investigation Suite',
    tagline: 'Open-Source Intelligence with Maltego',
    description:
      'Conducted structured OSINT exercises using Maltego to map digital footprints: DNS enumeration, email pattern discovery, social graph mapping, and domain relationship analysis. Built transform workflows to automate multi-source data correlation for reconnaissance targets.',
    tech: ['Maltego', 'OSINT', 'DNS', 'Python', 'Linux'],
    type: 'Cybersecurity',
    status: 'Active',
    github: 'https://github.com/Atoky5',
    color: '#0055FF',
  },
  {
    id: 'local-llm',
    name: 'Local AI/LLM Workflows',
    tagline: 'Privacy-First AI on Local Hardware',
    description:
      'Explored and deployed local AI/LLM workflows using Ollama, LM Studio, and open-source models (Llama, Mistral, CodeLlama). Built automation scripts that route tasks to appropriate models without sending data to external APIs — security-first by design.',
    tech: ['Python', 'Ollama', 'LM Studio', 'Llama', 'Linux', 'Bash'],
    type: 'AI Tools',
    status: 'Active',
    github: 'https://github.com/Atoky5',
    color: '#00D4FF',
  },
  {
    id: 'network-recon',
    name: 'Network Recon Toolkit',
    tagline: 'Automated Network Discovery & Analysis',
    description:
      'Python scripts wrapping Nmap, ARP-scan, and custom probes to automate network discovery on lab environments. Outputs structured reports showing open ports, OS fingerprints, service versions, and potential attack surfaces.',
    tech: ['Python', 'Nmap', 'Linux', 'Networking', 'Bash', 'JSON'],
    type: 'Cybersecurity',
    status: 'Stable',
    github: 'https://github.com/Atoky5',
    color: '#0055FF',
  },
  {
    id: 'device-support',
    name: 'Device Tech Support System',
    tagline: 'Customer-Facing Technical Troubleshooting',
    description:
      'At Lyca Mobile Baltimore, built expertise in device setup, technical troubleshooting for mobile hardware/software, SIM provisioning, and data privacy guidance. Handled 50+ customer cases on escalated device and account issues — real-world applied security.',
    tech: ['Android', 'iOS', 'SIM Tech', 'Data Privacy', 'Customer Support'],
    type: 'Experience',
    status: 'Active',
    github: 'https://github.com/Atoky5',
    color: '#4A7A8A',
  },
  {
    id: 'cs-coursework',
    name: 'CS Coursework Projects',
    tagline: 'Data Structures, OOP & Systems in Java/C++',
    description:
      'Academic projects implementing core CS concepts: linked lists, trees, sorting algorithms, OOP design patterns in Java and C++. Emphasis on clean architecture, algorithmic efficiency, and writing code that can be reasoned about under pressure.',
    tech: ['Java', 'C++', 'Python', 'Data Structures', 'OOP', 'Git'],
    type: 'Academic',
    status: 'Ongoing',
    github: 'https://github.com/Atoky5',
    color: '#00D4FF',
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-1, 1], [6, -6]);
  const rotateY = useTransform(mouseX, [-1, 1], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 2);
    mouseY.set(y * 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.9, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
          position: 'relative',
          height: '100%',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            padding: '28px',
            background: 'rgba(2,4,8,0.9)',
            borderTop: `2px solid ${project.color}`,
            borderRight: `1px solid ${hovered ? project.color + '55' : project.color + '22'}`,
            borderBottom: `1px solid ${hovered ? project.color + '55' : project.color + '22'}`,
            borderLeft: `1px solid ${hovered ? project.color + '55' : project.color + '22'}`,
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'border-color 0.3s',
            boxShadow: hovered
              ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${project.color}22, inset 0 1px 0 ${project.color}22`
              : '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Holographic shimmer on hover */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={hovered ? { x: '200%', opacity: [0, 0.3, 0] } : { x: '-100%', opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(90deg, transparent, ${project.color}22, transparent)`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Glitch effect on hover */}
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.05, 0, 0.03, 0] }}
              transition={{ duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  ${project.color}08 2px,
                  ${project.color}08 4px
                )`,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '10px',
                color: project.color,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '4px 10px',
                border: `1px solid ${project.color}33`,
                background: `${project.color}11`,
              }}>
                {project.type}
              </span>
              <span style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '10px',
                color: project.status === 'Active' || project.status === 'Running' ? '#00ff88' : '#4A7A8A',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {(project.status === 'Active' || project.status === 'Running') && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 8px #00ff88' }}
                  />
                )}
                {project.status}
              </span>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '18px',
              fontWeight: 700,
              color: '#E8F4F8',
              marginBottom: '6px',
              textShadow: hovered ? `0 0 20px ${project.color}` : 'none',
              transition: 'text-shadow 0.3s',
            }}>
              {project.name}
            </h3>

            <div style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '12px',
              color: project.color,
              marginBottom: '16px',
              letterSpacing: '0.5px',
            }}>
              {project.tagline}
            </div>

            {/* Description - visible on hover via animation */}
            <motion.p
              animate={{ opacity: hovered ? 1 : 0.6, height: 'auto' }}
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '12px',
                color: '#4A7A8A',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              {project.description}
            </motion.p>

            {/* Tech stack */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {project.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '10px',
                    color: '#4A7A8A',
                    padding: '3px 8px',
                    border: '1px solid rgba(0,212,255,0.15)',
                    letterSpacing: '1px',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* GitHub link */}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '11px',
                color: project.color,
                textDecoration: 'none',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              VIEW SOURCE
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FeaturedProject({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, filter: 'blur(14px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: '48px',
        background: 'rgba(2,4,8,0.95)',
        border: `1px solid ${project.color}33`,
        borderLeft: `3px solid ${project.color}`,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '80px',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${project.color}08, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Scanline texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(0,212,255,0.01) 3px,
          rgba(0,212,255,0.01) 4px
        )`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '10px',
              color: project.color,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              padding: '4px 12px',
              border: `1px solid ${project.color}`,
            }}>
              FEATURED PROJECT
            </span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 10px #00ff88',
                display: 'inline-block',
              }}
            />
          </div>

          <h3 style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 900,
            color: '#E8F4F8',
            marginBottom: '8px',
            lineHeight: 1.1,
            textShadow: `0 0 40px ${project.color}44`,
          }}>
            {project.name}
          </h3>

          <div style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '15px',
            color: project.color,
            marginBottom: '24px',
            letterSpacing: '0.5px',
          }}>
            {project.tagline}
          </div>

          <p style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '13px',
            color: '#4A7A8A',
            lineHeight: 2,
            marginBottom: '32px',
          }}>
            {project.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
            {project.tech.map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '11px',
                  color: project.color,
                  padding: '6px 14px',
                  border: `1px solid ${project.color}44`,
                  background: `${project.color}11`,
                  letterSpacing: '1px',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-orbitron)',
              fontSize: '12px',
              color: '#020408',
              background: project.color,
              padding: '14px 28px',
              textDecoration: 'none',
              letterSpacing: '2px',
              fontWeight: 700,
              textTransform: 'uppercase',
              boxShadow: `0 0 30px ${project.color}66`,
              transition: 'box-shadow 0.3s',
            }}
          >
            VIEW ON GITHUB
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Terminal mockup */}
        <div style={{
          background: '#010204',
          border: '1px solid rgba(0,212,255,0.2)',
          padding: '0',
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '12px',
        }}>
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
            alignItems: 'center',
          }}>
            {['#ff5f57', '#ffbd2e', '#28ca41'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <span style={{ color: '#4A7A8A', fontSize: '10px', marginLeft: '8px', letterSpacing: '1px' }}>
              moe@kali — linux-vm-lab — bash
            </span>
          </div>
          <div style={{ padding: '20px', lineHeight: 2 }}>
            {[
              { color: '#00D4FF', text: 'moe@kali:~$ vmware --list-vms' },
              { color: '#4A7A8A', text: 'Found 4 virtual machines:' },
              { color: '#00ff88', text: '  [ON]  kali-attacker   — 192.168.100.10' },
              { color: '#00ff88', text: '  [ON]  ubuntu-target   — 192.168.100.20' },
              { color: '#4A7A8A', text: '  [OFF] win10-endpoint  — 192.168.100.30' },
              { color: '#4A7A8A', text: '  [OFF] pfsense-fw      — 192.168.100.1' },
              { color: '', text: '' },
              { color: '#00D4FF', text: 'moe@kali:~$ nmap -sV -sC 192.168.100.20' },
              { color: '#4A7A8A', text: 'Starting Nmap scan on ubuntu-target...' },
              { color: '#E8F4F8', text: '22/tcp  open  ssh     OpenSSH 9.3' },
              { color: '#E8F4F8', text: '80/tcp  open  http    Apache 2.4.57' },
              { color: '', text: '' },
              { color: '#00D4FF', text: 'moe@kali:~$ ssh -i lab.key moe@192.168.100.20' },
              { color: '#00ff88', text: 'Connected to ubuntu-target successfully.' },
              { color: '#FF4500', text: '[LAB] Privilege escalation exercise active' },
            ].map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                style={{ color: line.color || 'transparent', minHeight: '1.5em' }}
              >
                {line.text || '\u00A0'}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-150px' });

  const featuredProject = PROJECTS.find((p) => p.featured)!;
  const otherProjects = PROJECTS.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        background: '#020408',
        padding: '120px 0',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '80px' }}
        >
          <div style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '11px',
            color: '#4A7A8A',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ display: 'inline-block', width: '40px', height: '1px', background: '#00D4FF' }} />
            03 / PROJECTS
          </div>
          <h2 style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            color: '#E8F4F8',
          }}>
            The Work
          </h2>
        </motion.div>

        {/* Featured */}
        <FeaturedProject project={featuredProject} />

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '2px',
        }}>
          {otherProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
