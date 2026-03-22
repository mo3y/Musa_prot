'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'ABOUT', href: '#about' },
  { label: 'SKILLS', href: '#skills' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'CONTACT', href: '#contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 50);
    setHidden(y > lastScrollY.current && y > 200);
    lastScrollY.current = y;
  });

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -80 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9990,
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(2,4,8,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,212,255,0.08)' : 'none',
        transition: 'background 0.4s, backdrop-filter 0.4s',
      }}
    >
      {/* Logo */}
      <motion.a
        href="#"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        data-cursor
        whileHover={{ scale: 1.05 }}
        style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: '20px',
          fontWeight: 900,
          color: '#E8F4F8',
          textDecoration: 'none',
          letterSpacing: '3px',
          textShadow: '0 0 20px rgba(0,212,255,0.4)',
        }}
      >
        MOE
      </motion.a>

      {/* Nav items */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {NAV_ITEMS.map(({ label, href }) => (
          <motion.button
            key={label}
            data-cursor
            onClick={() => handleNavClick(href)}
            whileHover={{ y: -2 }}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '11px',
              color: '#4A7A8A',
              letterSpacing: '2px',
              background: 'none',
              border: 'none',
              padding: '4px 0',
              cursor: 'none',
              position: 'relative',
            }}
          >
            {label}
            <motion.div
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: '#00D4FF',
                transformOrigin: 'left',
                boxShadow: '0 0 8px #00D4FF',
              }}
            />
          </motion.button>
        ))}

        <motion.a
          href="mailto:m501@umbc.edu"
          data-cursor
          whileHover={{ scale: 1.02 }}
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '11px',
            color: '#00D4FF',
            letterSpacing: '2px',
            padding: '8px 20px',
            border: '1px solid rgba(0,212,255,0.4)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(0,212,255,0.1)',
            transition: 'box-shadow 0.3s',
          }}
        >
          HIRE ME
        </motion.a>
      </div>
    </motion.nav>
  );
}
