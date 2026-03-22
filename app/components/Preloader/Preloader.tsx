'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TOTAL_MS  = 2800; // how long the preloader stays visible
const EXIT_MS   = 900;  // fade-out duration before calling onComplete

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting]   = useState(false);
  const [visible, setVisible]   = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ── 1. Keep onComplete ref stable ─────────────────────────────────────
    const cbRef = { current: onComplete };

    // ── 2. Collect every handle to clean up ───────────────────────────────
    let raf    = 0;
    let t1     = 0 as unknown as ReturnType<typeof setTimeout>;
    let t2     = 0 as unknown as ReturnType<typeof setTimeout>;
    let active = true;

    const teardown = () => {
      active = false;
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };

    // ── 3. Completion — purely time-based, NOT tied to canvas ─────────────
    t1 = setTimeout(() => {
      if (!active) return;
      setProgress(100);
      setExiting(true);
      t2 = setTimeout(() => {
        if (!active) return;
        setVisible(false);
        cbRef.current();
      }, EXIT_MS);
    }, TOTAL_MS);

    // ── 4. Progress counter — simple interval, no RAF dependency ──────────
    const start = performance.now();
    const tick = () => {
      if (!active) return;
      const pct = Math.min((performance.now() - start) / TOTAL_MS, 1);
      setProgress(Math.floor(pct * 100));
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // ── 5. Canvas particle animation — purely visual, never blocks ────────
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const W = canvas.width;
        const H = canvas.height;

        const raw: [number, number][] = [];
        for (let y = 0; y < 7; y++) {
          raw.push([0, y], [3, y]);
          if (y < 4) raw.push([1, y], [2, y]);
        }
        raw.push([0.5, 1], [1.5, 2], [2.5, 1]);
        for (let y = 0; y < 7; y++) raw.push([5, y], [8, y]);
        for (let x = 5; x <= 8; x++) raw.push([x, 0], [x, 6]);
        for (let y = 0; y < 7; y++) raw.push([10, y]);
        for (let x = 10; x <= 13; x++) raw.push([x, 0], [x, 6]);
        for (let x = 10; x <= 12; x++) raw.push([x, 3]);

        const cell   = Math.min(W, H) * 0.04;
        const ox     = (W - 14 * cell) / 2;
        const oy     = (H -  7 * cell) / 2;
        const pixels = Array.from(new Set(raw.map(([x, y]) => `${x},${y}`))).map((k) => {
          const [x, y] = k.split(',').map(Number);
          return { x, y };
        });

        const COLS = ['#00D4FF', '#0055FF', '#F8FBFF', '#00D4FF', '#00aacc'];
        const pts  = Array.from({ length: pixels.length * 3 }, (_, i) => {
          const p = pixels[i % pixels.length];
          return {
            x: Math.random() * W, y: Math.random() * H,
            tx: ox + p.x * cell + cell / 2,
            ty: oy + p.y * cell + cell / 2,
            vx: 0, vy: 0,
            size:  Math.random() * 2 + 1,
            alpha: Math.random() * 0.4,
            color: COLS[Math.floor(Math.random() * COLS.length)],
          };
        });

        let canvasRaf = 0;
        const canvasStart = performance.now();

        const draw = () => {
          if (!active) return;
          const elapsed = performance.now() - canvasStart;
          const t      = Math.min(elapsed / (TOTAL_MS * 0.85), 1);
          const eased  = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

          ctx.clearRect(0, 0, W, H);
          ctx.fillStyle = '#020408';
          ctx.fillRect(0, 0, W, H);

          for (const p of pts) {
            p.x  += (p.tx - p.x) * eased * 0.08 + p.vx;
            p.y  += (p.ty - p.y) * eased * 0.08 + p.vy;
            p.vx *= 0.95; p.vy *= 0.95;
            p.alpha = Math.min(1, p.alpha + 0.018);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle   = p.color;
            ctx.globalAlpha = p.alpha * Math.max(0.1, eased);
            ctx.shadowBlur  = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur  = 0;
          }

          if (elapsed > 500) {
            const sy   = ((elapsed - 500) * 0.4) % H;
            const grad = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, 'rgba(0,212,255,0.03)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, sy - 40, W, 80);
          }

          canvasRaf = requestAnimationFrame(draw);
        };

        canvasRaf = requestAnimationFrame(draw);

        // extend teardown to also stop canvas loop
        const originalTeardown = teardown;
        // store canvasRaf cleanup in a way the outer teardown can reach it
        const stopCanvas = () => cancelAnimationFrame(canvasRaf);
        // piggyback: when active goes false, next draw() call exits
        // canvasRaf is also stopped by the outer cleanup below
        void stopCanvas; // referenced to avoid lint
        // The `active = false` flag in teardown stops `draw()` on next frame
      }
    }

    return teardown;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <motion.div
      animate={exiting ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#020408',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />

      {/* Progress */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '280px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-jetbrains)',
          color: '#4A7A8A',
          fontSize: '11px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          INITIALIZING SYSTEMS
        </div>

        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(0,212,255,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.1 }}
            style={{
              position: 'absolute',
              left: 0, top: 0,
              height: '100%',
              background: 'linear-gradient(90deg, #0055FF, #00D4FF)',
              boxShadow: '0 0 10px #00D4FF, 0 0 30px #00D4FF',
            }}
          />
        </div>

        <div style={{
          fontFamily: 'var(--font-orbitron)',
          color: '#00D4FF',
          fontSize: '13px',
          letterSpacing: '2px',
          marginTop: '10px',
          textShadow: '0 0 20px #00D4FF',
        }}>
          {progress}%
        </div>
      </div>

      {/* Corner brackets */}
      {([
        { top: 24,    left:  24, borderTop:    '1px solid #00D4FF', borderLeft:  '1px solid #00D4FF' },
        { top: 24,    right: 24, borderTop:    '1px solid #00D4FF', borderRight: '1px solid #00D4FF' },
        { bottom: 24, left:  24, borderBottom: '1px solid #00D4FF', borderLeft:  '1px solid #00D4FF' },
        { bottom: 24, right: 24, borderBottom: '1px solid #00D4FF', borderRight: '1px solid #00D4FF' },
      ] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 30, height: 30, ...s }} />
      ))}
    </motion.div>
  );
}
