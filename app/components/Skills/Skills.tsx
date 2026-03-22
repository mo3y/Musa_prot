'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';

const HackerScene = dynamic(() => import('./HackerScene'), { ssr: false });

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-150px' });

  return (
    <section
      id="skills"
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        background: '#020408',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 0',
      }}
    >
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '60px' }}
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
            02 / SKILLS
          </div>
          <h2 style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            color: '#E8F4F8',
            marginBottom: '12px',
          }}>
            The Arsenal
          </h2>
          <p style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '12px',
            color: '#4A7A8A',
            letterSpacing: '1px',
          }}>
            Live network monitor · Attack simulation · Real commands
          </p>
        </motion.div>

        {/* Hacker scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(14px)' }}
          animate={inView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            border: '1px solid rgba(0,212,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <HackerScene visible={inView} />

          {/* Top status bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #0055FF, #00D4FF, #00ff88, #00D4FF, #0055FF)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }} />
        </motion.div>

        {/* Bottom metadata row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '24px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'THREAT DETECTION', value: 'ACTIVE', color: '#00ff88' },
            { label: 'FIREWALL STATUS',  value: 'BLOCKING', color: '#00D4FF' },
            { label: 'LOCATION',         value: 'Baltimore, MD', color: '#4A7A8A' },
            { label: 'DEGREE',           value: 'BS Computer Science · UMBC', color: '#4A7A8A' },
            { label: 'EXP. GRADUATION',  value: 'May 2028', color: '#4A7A8A' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '9px',
                color: '#4A7A8A',
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}>
                {label}
              </span>
              <span style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '12px',
                color,
                letterSpacing: '1px',
              }}>
                {value}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
