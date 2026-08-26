'use client';

import { useState } from 'react';
import SmoothScroll from './chrome/SmoothScroll';
import Preloader from './chrome/Preloader';
import Cursor from './chrome/Cursor';
import Nav from './chrome/Nav';
import Footer from './chrome/Footer';
import StickyBook from './chrome/StickyBook';

import Hero from './sections/Hero';
import Journey from './sections/Journey';
import Preserve from './sections/Preserve';
import Categories from './sections/Categories';
import Lens from './sections/Lens';
import MemoryWall from './sections/MemoryWall';
import Testimonials from './sections/Testimonials';
import About from './sections/About';
import Process from './sections/Process';
import Services from './sections/Services';
import Booking from './sections/Booking';
import Final from './sections/Final';

/**
 * The whole experience, in the order it is meant to be felt:
 * the wow, the journey, the promise, the proof, and then the ask.
 */
export default function Experience() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <SmoothScroll />
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <Nav />

      <main id="main">
        <Hero ready={ready} />
        <Journey />
        <Preserve />
        <Categories />
        <Lens />
        <MemoryWall />
        <Testimonials />
        <About />
        <Process />
        <Services />
        <Booking />
        <Final />
      </main>

      <Footer />
      <StickyBook />

      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />
    </>
  );
}
