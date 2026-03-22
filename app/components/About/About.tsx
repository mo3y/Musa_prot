'use client';

import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';

const SolarSystem = dynamic(() => import('./SolarSystem'), { ssr: false });

const TIMELINE_EVENTS = [
  {
    year: '2022',
    title: 'Foundation',
    org: 'CCBC',
    description: 'Started the journey: Linux, networking fundamentals, and first virtual machines in VMware. Realized that understanding systems means being able to break them.',
    color: '#4A7A8A',
  },
  {
    year: '2023',
    title: 'Exploration',
    org: 'CCBC → Self-Study',
    description: 'OSINT investigations with Maltego. Local AI/LLM workflows. Python scripting. Every tool mastered is another language spoken.',
    color: '#0055FF',
  },
  {
    year: '2024',
    title: 'Transfer',
    org: 'UMBC — BS Computer Science',
    description: 'Transferred to UMBC to pursue a BS in Computer Science. Deeper focus on data structures, OOP, and applied cybersecurity fundamentals.',
    color: '#00D4FF',
  },
  {
    year: '2025',
    title: 'Now',
    org: 'UMBC · Baltimore, MD',
    description: 'Building at the intersection of AI and security. Sales experience at Lyca Mobile sharpened communication, device troubleshooting, and data privacy instincts.',
    color: '#00D4FF',
  },
  {
    year: '→',
    title: 'Next',
    org: 'Seeking Internship · 2025',
    description: 'Actively seeking cybersecurity and AI internships. Expected graduation May 2028. Ready to operate at the frontier.',
    color: '#FF4500',
  },
];

function TimelineEvent({ event, index }: { event: typeof TIMELINE_EVENTS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {/* Left: year + dot */}
      <div style={{ flexShrink: 0, width: '52px', textAlign: 'right', paddingTop: '4px' }}>
        <div style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: '11px',
          color: event.color,
          letterSpacing: '1px',
          textShadow: `0 0 10px ${event.color}`,
        }}>
          {event.year}
        </div>
      </div>

      {/* Center: dot + vertical connector handled by parent */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: event.color,
          boxShadow: `0 0 12px ${event.color}, 0 0 24px ${event.color}66`,
          marginTop: '4px',
          flexShrink: 0,
        }} />
      </div>

      {/* Right: content card */}
      <div style={{
        flex: 1,
        padding: '18px 22px',
        background: 'rgba(2, 4, 8, 0.75)',
        border: `1px solid ${event.color}22`,
        borderLeft: `2px solid ${event.color}`,
        marginBottom: '12px',
      }}>
        <div style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: '14px',
          fontWeight: 700,
          color: '#E8F4F8',
          marginBottom: '4px',
        }}>
          {event.title}
        </div>
        <div style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '11px',
          color: event.color,
          marginBottom: '10px',
          letterSpacing: '1px',
        }}>
          {event.org}
        </div>
        <p style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '12px',
          color: '#4A7A8A',
          lineHeight: 1.75,
          margin: 0,
        }}>
          {event.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-150px' });
  const textInView = useInView(textRef, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        background: '#020408',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 0 80px',
      }}
    >
      {/* Background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              borderRadius: '50%',
              background: Math.random() > 0.7 ? '#00D4FF' : '#0055FF',
              boxShadow: `0 0 6px ${Math.random() > 0.7 ? '#00D4FF' : '#0055FF'}`,
            }}
          />
        ))}
      </div>

      {/* Section label */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '11px',
            color: '#4A7A8A',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ display: 'inline-block', width: '40px', height: '1px', background: '#00D4FF' }} />
          01 / ABOUT
        </motion.div>

        {/* Asymmetric two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '52% 44%',
          gap: '40px',
          alignItems: 'center',
          marginBottom: '100px',
        }}>
          {/* Left: philosophical statement */}
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, x: -60, filter: 'blur(12px)' }}
            animate={textInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              color: '#E8F4F8',
              lineHeight: 1.2,
              marginBottom: '32px',
            }}>
              Security is not a feature —
              <br />
              <span style={{
                color: '#00D4FF',
                textShadow: '0 0 30px rgba(0,212,255,0.5)',
              }}>
                it is a mindset
              </span>
              <br />
              built from first principles.
            </h2>

            <div style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, #00D4FF, transparent)',
              marginBottom: '32px',
            }} />

            <p style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 'clamp(13px, 1.3vw, 15px)',
              color: '#4A7A8A',
              lineHeight: 2,
              marginBottom: '24px',
            }}>
              I am Musa Allami — Moe. A Computer Science student at UMBC in
              Baltimore, MD, building at the boundary where security meets
              intelligence. I spin up Linux VMs, run OSINT with Maltego, explore
              local AI/LLM workflows, and troubleshoot devices for real customers
              at Lyca Mobile — theory and practice, no gap between them.
            </p>

            <p style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 'clamp(13px, 1.3vw, 15px)',
              color: '#4A7A8A',
              lineHeight: 2,
              marginBottom: '40px',
            }}>
              Python, Java, C++. Linux, VMware, Git. Networking fundamentals,
              data structures, OOP. Every skill is a new vector of understanding.
              Every vulnerability patched is an argument won against entropy.
              Astronomy teaches me the scale of what&apos;s possible.
              Security teaches me nothing is safe unless you make it so.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '40px' }}>
              {[
                { value: 'BS CS', label: 'UMBC · May 2028' },
                { value: 'MD', label: 'Baltimore' },
                { value: '∞', label: 'Curiosity' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{
                    fontFamily: 'var(--font-orbitron)',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#00D4FF',
                    textShadow: '0 0 20px #00D4FF',
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '11px',
                    color: '#4A7A8A',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Solar System */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(16px)' }}
            animate={inView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: '420px', position: 'relative', overflow: 'hidden' }}
          >
            <Canvas camera={{ position: [0, 3, 13], fov: 60 }} dpr={[1, 1.5]}>
              <Suspense fallback={null}>
                <SolarSystem />
              </Suspense>
            </Canvas>

            {/* Floating label */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '10px',
              color: '#4A7A8A',
              letterSpacing: '2px',
            }}>
              SOLAR SYSTEM · REAL-TIME
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '11px',
            color: '#4A7A8A',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '40px',
          }}>
            TRAJECTORY
          </div>

          {/* Vertical timeline */}
          <div style={{ position: 'relative', paddingLeft: '4px' }}>
            {/* Vertical line running through dots */}
            <div style={{
              position: 'absolute',
              top: '9px',
              left: '81px', // year(52) + gap(24) + dot-center(5) = 81
              bottom: '20px',
              width: '1px',
              background: 'linear-gradient(to bottom, #00D4FF44, #0055FF33, transparent)',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              {TIMELINE_EVENTS.map((event, i) => (
                <TimelineEvent key={i} event={event} index={i} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
