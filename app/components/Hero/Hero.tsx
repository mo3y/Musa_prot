'use client';

import { useRef, useState, useEffect, Suspense, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

// ── Isolated Canvas — React.memo + no EffectComposer = zero flicker ───────────
type MouseRef = React.MutableRefObject<{ x: number; y: number }>;

const HeroCanvas = memo(function HeroCanvas({ mouseRef }: { mouseRef: MouseRef }) {
  return (
    <Canvas
      key="hero-canvas"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10], fov: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <Suspense fallback={null}>
        <HeroScene mouseRef={mouseRef} />
      </Suspense>
    </Canvas>
  );
});

// ── Typewriter lives in its own component — its state changes never reach Canvas ─
const TYPEWRITER_STRINGS = [
  'Cybersecurity Engineer',
  'AI Builder',
  'System Architect',
  'Security Researcher',
];

function TypewriterText() {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting]   = useState(false);
  const [charIndex, setCharIndex]     = useState(0);

  useEffect(() => {
    const current = TYPEWRITER_STRINGS[currentIndex];
    const speed   = isDeleting ? 35 : 95;
    const timer   = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 2200);
        } else {
          setCharIndex((c) => c + 1);
        }
      } else {
        setDisplayText(current.slice(0, charIndex - 1));
        if (charIndex <= 0) {
          setIsDeleting(false);
          setCurrentIndex((i) => (i + 1) % TYPEWRITER_STRINGS.length);
        } else {
          setCharIndex((c) => c - 1);
        }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, currentIndex, isDeleting]);

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: [1, 0, 1, 0] }}
        style={{
          display: 'inline-block',
          width: '3px',
          height: '1.1em',
          background: '#00D4FF',
          marginLeft: '3px',
          verticalAlign: 'text-bottom',
          boxShadow: '0 0 12px #00D4FF, 0 0 30px rgba(0,212,255,0.6)',
        }}
      />
    </span>
  );
}

// ── Tagline parts ──────────────────────────────────────────────────────────────
const TAGLINE_PARTS  = ['Building systems', 'as secure', 'as', 'intelligence.'];
const TAGLINE_PARTS2 = ['Every threat', 'is a puzzle.', 'Every solution', 'is a weapon.'];

// ── Hero ───────────────────────────────────────────────────────────────────────
export default function Hero({ entered }: { entered: boolean }) {
  // ── Mouse as REF — never triggers re-render ──────────────────────────────────
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ── Lightning flash — DOM ref, no state, no React re-render ──────────────────
  const flashRef     = useRef<HTMLDivElement>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY }  = useScroll();

  const titleY       = useTransform(scrollY, [0, 600], [0, -120]);
  const titleOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    // Mouse → ref only, zero re-renders
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  useEffect(() => {
    const handler = () => {
      const el = flashRef.current;
      if (!el) return;
      // Direct DOM mutation — zero React re-renders, zero interference with WebGL frame
      el.style.transition = 'opacity 0.04s ease-in';
      el.style.opacity = '0.06';
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        if (flashRef.current) {
          flashRef.current.style.transition = 'opacity 0.9s ease-out';
          flashRef.current.style.opacity = '0';
        }
      }, 180);
    };
    window.addEventListener('lightning-strike', handler);
    return () => {
      window.removeEventListener('lightning-strike', handler);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#020408',
      }}
    >
      {/* ── Stable 3D canvas — isolated from all parent state ───────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <HeroCanvas mouseRef={mouseRef} />
      </div>

      {/* ── Lightning screen flash — pure CSS, zero React re-renders ────────── */}
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(220,240,255,1)',
          pointerEvents: 'none',
          zIndex: 8,
          opacity: 0,
        }}
      />

      {/* ── Vignette ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(2,4,8,0.7) 100%)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {/* ── CSS noise overlay (film grain) ───────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
        opacity: 0.035,
        pointerEvents: 'none',
        zIndex: 5,
        mixBlendMode: 'screen',
      }} />

      {/* ── Text overlay — above canvas (zIndex 10) ──────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <motion.div
          style={{ y: titleY, opacity: titleOpacity, textAlign: 'center', position: 'relative' }}
        >
          {/* Dark radial backdrop — keeps text crisp over any 3D depth */}
          <div style={{
            position: 'absolute',
            inset: '-60px -80px',
            background: 'radial-gradient(ellipse at center, rgba(2,4,8,0.7) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.6em' }}
            animate={entered ? { opacity: 1, letterSpacing: '0.35em' } : {}}
            transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 'clamp(10px, 1.1vw, 13px)',
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginBottom: '24px',
              position: 'relative',
            }}
          >
            MUSA ALLAMI &nbsp;·&nbsp; UMBC &nbsp;·&nbsp; EST. 2024
          </motion.div>

          {/* MOE */}
          <motion.h1
            initial={{ opacity: 0, scale: 1.22, filter: 'blur(18px)' }}
            animate={entered
              ? { opacity: 1, scale: 1.0, filter: 'blur(0px)' }
              : { opacity: 0, scale: 1.22, filter: 'blur(18px)' }
            }
            transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 'clamp(80px, 15vw, 190px)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 0.88,
              letterSpacing: '-0.02em',
              textShadow: `
                0 0 0px rgba(255,255,255,0.9),
                0 0 30px rgba(0,212,255,0.9),
                0 0 70px rgba(0,212,255,0.6),
                0 0 140px rgba(0,212,255,0.3),
                0 0 250px rgba(0,212,255,0.15)
              `,
              marginBottom: '32px',
              position: 'relative',
            }}
          >
            MOE
          </motion.h1>

          {/* Typewriter subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={entered ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 1.1, ease: 'easeOut' }}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 'clamp(15px, 2.2vw, 24px)',
              color: '#FFFFFF',
              letterSpacing: '0.06em',
              height: '2.2em',
              textShadow: `
                0 0 20px rgba(0,212,255,0.9),
                0 0 50px rgba(0,212,255,0.5),
                0 2px 8px rgba(0,0,0,0.8)
              `,
              position: 'relative',
            }}
          >
            <TypewriterText />
          </motion.div>

          {/* Staggered tagline */}
          <div style={{ marginTop: '20px', lineHeight: 2, position: 'relative' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 6px', marginBottom: '4px' }}>
              {TAGLINE_PARTS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={entered ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: 'clamp(12px, 1.3vw, 15px)',
                    color: 'rgba(255,255,255,0.75)',
                    textShadow: '0 1px 10px rgba(0,0,0,0.9)',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 6px' }}>
              {TAGLINE_PARTS2.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={entered ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 2.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: 'clamp(12px, 1.3vw, 15px)',
                    color: 'rgba(255,255,255,0.5)',
                    textShadow: '0 1px 10px rgba(0,0,0,0.9)',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 3.0 }}
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textShadow: '0 0 12px rgba(0,212,255,0.7)',
          }}>
            SCROLL
          </span>
          <div style={{ position: 'relative', width: '1px', height: '54px', background: 'rgba(255,255,255,0.2)' }}>
            <motion.div
              animate={{ y: [0, 44, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
              style={{
                position: 'absolute',
                top: 0,
                left: '-3px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 12px #00D4FF, 0 0 25px rgba(0,212,255,0.7)',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(to bottom, transparent, #020408)',
        pointerEvents: 'none',
        zIndex: 6,
      }} />
    </section>
  );
}
