'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

function MagneticLink({
  href,
  label,
  sublabel,
  color = '#00D4FF',
  icon,
}: {
  href: string;
  label: string;
  sublabel?: string;
  color?: string;
  icon: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  };

  return (
    <motion.a
      href={href}
      target={href.startsWith('mailto') || href.startsWith('tel') ? undefined : '_blank'}
      rel="noopener noreferrer"
      data-cursor
      style={{
        x: springX,
        y: springY,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        padding: '28px 32px',
        border: `1px solid ${hovered ? color + '55' : color + '1a'}`,
        background: hovered ? `${color}0d` : 'transparent',
        transition: 'border-color 0.3s, background 0.3s',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '130px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
      whileHover={{ scale: 1.04 }}
    >
      <motion.div
        animate={hovered
          ? { color, filter: `drop-shadow(0 0 10px ${color})` }
          : { color: '#4A7A8A', filter: 'none' }
        }
        transition={{ duration: 0.25 }}
      >
        {icon}
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '11px',
          color: hovered ? color : '#4A7A8A',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '9px',
            color: 'rgba(74,122,138,0.7)',
            marginTop: '3px',
            letterSpacing: '1px',
          }}>
            {sublabel}
          </div>
        )}
      </div>
    </motion.a>
  );
}

function LightningEmailLink() {
  const [hovered, setHovered] = useState(false);
  const [struck, setStruck] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    setTimeout(() => { setStruck(true); setTimeout(() => setStruck(false), 280); }, 180);
  };

  return (
    <motion.a
      href="mailto:m501@umbc.edu"
      data-cursor
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        textDecoration: 'none',
        padding: '22px 36px',
        border: `1px solid ${hovered ? '#00D4FF55' : '#00D4FF1a'}`,
        background: struck ? 'rgba(0,212,255,0.07)' : 'transparent',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
        maxWidth: '520px',
        width: '100%',
      }}
      whileHover={{ x: [0, -2, 2, -1, 1, 0] }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        animate={struck ? { opacity: [0, 0.35, 0] } : { opacity: 0 }}
        transition={{ duration: 0.28 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(248,251,255,0.08)', pointerEvents: 'none' }}
      />
      <motion.div
        animate={hovered
          ? { color: '#F8FBFF', filter: 'drop-shadow(0 0 12px #F8FBFF) drop-shadow(0 0 25px #00D4FF)', rotate: [0, -4, 4, -2, 2, 0] }
          : { color: '#4A7A8A', filter: 'none', rotate: 0 }
        }
        transition={{ duration: 0.3 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </motion.div>
      <div>
        <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#4A7A8A', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
          UNIVERSITY EMAIL
        </div>
        <div style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: 'clamp(13px, 1.8vw, 18px)',
          color: hovered ? '#00D4FF' : '#E8F4F8',
          letterSpacing: '0.5px',
          transition: 'color 0.3s',
          textShadow: hovered ? '0 0 20px #00D4FF' : 'none',
        }}>
          m501@umbc.edu
        </div>
      </div>
      <motion.div
        animate={hovered ? { x: 8, opacity: 1 } : { x: 0, opacity: 0.4 }}
        style={{ marginLeft: 'auto', color: '#00D4FF' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </motion.a>
  );
}

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-150px' });

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        background: '#020408',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px',
          background: 'radial-gradient(ellipse at center bottom, rgba(0,212,255,0.05) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,212,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.018) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
      </div>

      <div style={{ maxWidth: '820px', width: '100%', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#4A7A8A',
            letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '24px',
          }}>
            04 / CONTACT
          </div>
          <h2 style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 900, color: '#E8F4F8', lineHeight: 1, marginBottom: '16px',
          }}>
            Let&apos;s Build
            <br />
            <span style={{ color: '#00D4FF', textShadow: '0 0 40px rgba(0,212,255,0.6)' }}>
              Something Real
            </span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: '#4A7A8A',
            lineHeight: 2, maxWidth: '460px', margin: '0 auto',
          }}>
            Computer Science student at UMBC, Baltimore MD. Actively seeking
            cybersecurity and AI internships for 2025. If you&apos;re building something
            serious — reach out directly.
          </p>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '11px 22px',
            border: '1px solid rgba(0,255,136,0.3)',
            background: 'rgba(0,255,136,0.04)',
          }}>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 14px #00ff88' }}
            />
            <span style={{
              fontFamily: 'var(--font-jetbrains)', fontSize: '11px',
              color: '#00ff88', letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              Available — Open to Internships · 2025
            </span>
          </div>
        </motion.div>

        {/* Email CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}
        >
          <LightningEmailLink />
        </motion.div>

        {/* Contact grid: phone + socials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.45 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '2px', flexWrap: 'wrap', marginBottom: '48px' }}
        >
          {/* Phone */}
          <MagneticLink
            href="tel:4434175707"
            label="Phone"
            sublabel="443-417-5707"
            color="#00D4FF"
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
              </svg>
            }
          />

          {/* GitHub */}
          <MagneticLink
            href="https://github.com/Atoky5"
            label="GitHub"
            sublabel="Atoky5"
            color="#00D4FF"
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            }
          />

          {/* LinkedIn */}
          <MagneticLink
            href="https://linkedin.com/in/musa-allami-b00a05310"
            label="LinkedIn"
            sublabel="musa-allami"
            color="#0055FF"
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            }
          />
        </motion.div>

        {/* Info strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
            padding: '20px',
            border: '1px solid rgba(0,212,255,0.07)',
            background: 'rgba(0,212,255,0.02)',
            marginBottom: '48px',
          }}
        >
          {[
            { label: 'LOCATION', value: 'Baltimore, MD' },
            { label: 'DEGREE', value: 'BS Computer Science · UMBC' },
            { label: 'GRADUATION', value: 'May 2028' },
            { label: 'SEEKING', value: 'Cybersecurity & AI Internship' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '8px', color: '#4A7A8A', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#E8F4F8', letterSpacing: '0.5px' }}>
                {value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          style={{ textAlign: 'center', paddingTop: '32px', borderTop: '1px solid rgba(0,212,255,0.07)' }}
        >
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#4A7A8A', letterSpacing: '2px' }}>
            MUSA (MOE) ALLAMI &nbsp;·&nbsp; UMBC &nbsp;·&nbsp; BALTIMORE, MD &nbsp;·&nbsp; 2025
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: 'rgba(74,122,138,0.35)', letterSpacing: '1px', marginTop: '6px' }}>
            Built with precision. No templates. No shortcuts.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
