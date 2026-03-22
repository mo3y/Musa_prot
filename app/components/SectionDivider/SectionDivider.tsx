'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function SectionDivider({ label }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      {/* Left line — draws from left */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{
          flex: 1,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.15) 30%, rgba(0,212,255,0.5) 80%, rgba(0,212,255,0.8) 100%)',
          transformOrigin: 'left',
        }}
      />

      {/* Optional center label */}
      {label && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '9px',
            color: 'rgba(0,212,255,0.5)',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {label}
        </motion.span>
      )}

      {/* Right line — draws from right */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{
          flex: 1,
          height: '1px',
          background: 'linear-gradient(90deg, rgba(0,212,255,0.8) 0%, rgba(0,212,255,0.5) 20%, rgba(0,212,255,0.15) 70%, transparent 100%)',
          transformOrigin: 'right',
        }}
      />

      {/* Glowing center dot */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 1.4, ease: 'backOut' }}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#00D4FF',
          boxShadow: '0 0 12px #00D4FF, 0 0 30px rgba(0,212,255,0.5)',
        }}
      />
    </div>
  );
}
