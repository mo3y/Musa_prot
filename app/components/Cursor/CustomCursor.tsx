'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const trailX = useMotionValue(-100);
  const trailY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const trailSpringConfig = { damping: 40, stiffness: 200 };

  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const trailXSpring = useSpring(trailX, trailSpringConfig);
  const trailYSpring = useSpring(trailY, trailSpringConfig);

  const isHoveringRef = useRef(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 6);
      cursorY.set(e.clientY - 6);
      trailX.set(e.clientX - 16);
      trailY.set(e.clientY - 16);
    };

    const handleMouseEnterLink = () => {
      isHoveringRef.current = true;
      dotRef.current?.classList.add('cursor-hover');
    };

    const handleMouseLeaveLink = () => {
      isHoveringRef.current = false;
      dotRef.current?.classList.remove('cursor-hover');
    };

    window.addEventListener('mousemove', moveCursor);

    const interactiveElements = document.querySelectorAll('a, button, [data-cursor]');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnterLink);
      el.addEventListener('mouseleave', handleMouseLeaveLink);
    });

    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll('a, button, [data-cursor]');
      elements.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnterLink);
        el.addEventListener('mouseleave', handleMouseLeaveLink);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
    };
  }, [cursorX, cursorY, trailX, trailY]);

  return (
    <>
      {/* Trail ring */}
      <motion.div
        style={{
          x: trailXSpring,
          y: trailYSpring,
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid rgba(0, 212, 255, 0.5)',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'screen',
        }}
      />

      {/* Core dot */}
      <motion.div
        ref={dotRef}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          position: 'fixed',
          top: 0,
          left: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#00D4FF',
          pointerEvents: 'none',
          zIndex: 100000,
          boxShadow: '0 0 10px #00D4FF, 0 0 30px #00D4FF, 0 0 60px rgba(0,212,255,0.5)',
          mixBlendMode: 'screen',
        }}
      />

      <style>{`
        .cursor-hover {
          transform: scale(2) !important;
          background-color: transparent !important;
          border: 2px solid #00D4FF !important;
        }
      `}</style>
    </>
  );
}
