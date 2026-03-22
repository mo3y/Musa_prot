'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Preloader       = dynamic(() => import('./components/Preloader/Preloader'),                 { ssr: false });
const Hero            = dynamic(() => import('./components/Hero/Hero'),                           { ssr: false });
const CustomCursor    = dynamic(() => import('./components/Cursor/CustomCursor'),                 { ssr: false });
const SmoothScroll    = dynamic(() => import('./components/SmoothScroll/SmoothScrollProvider'),   { ssr: false });
const Nav             = dynamic(() => import('./components/Nav/Nav'),                             { ssr: false });
const About           = dynamic(() => import('./components/About/About'),                         { ssr: false });
const Skills          = dynamic(() => import('./components/Skills/Skills'),                       { ssr: false });
const Projects        = dynamic(() => import('./components/Projects/Projects'),                   { ssr: false });
const Contact         = dynamic(() => import('./components/Contact/Contact'),                     { ssr: false });
const SectionDivider  = dynamic(() => import('./components/SectionDivider/SectionDivider'),       { ssr: false });

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [entered, setEntered] = useState(false);

  const handlePreloaderComplete = () => {
    setPreloaderDone(true);
    setTimeout(() => setEntered(true), 100);
  };

  useEffect(() => {
    document.body.style.overflow = preloaderDone ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [preloaderDone]);

  return (
    <>
      <CustomCursor />
      <Preloader onComplete={handlePreloaderComplete} />

      <SmoothScroll>
        <Nav />
        <main>
          <Hero entered={entered} />
          <SectionDivider label="ABOUT" />
          <About />
          <SectionDivider label="SKILLS" />
          <Skills />
          <SectionDivider label="PROJECTS" />
          <Projects />
          <SectionDivider label="CONTACT" />
          <Contact />
        </main>
      </SmoothScroll>
    </>
  );
}
