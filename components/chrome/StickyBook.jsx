'use client';

import { useEffect, useState } from 'react';
import s from './chrome.module.css';
import { studio } from '@/lib/studio';

/** Mobile-only booking rail. Appears after the hero, hides inside the form. */
export default function StickyBook() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const book = document.getElementById('book');
      const inForm =
        book && book.getBoundingClientRect().top < window.innerHeight * 0.9;
      setShow(y > window.innerHeight * 0.9 && !inForm);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={s.sticky} data-show={show}>
      <a className={s.sticky__call} href={studio.phoneHref} aria-label="Call the studio">
        Call
      </a>
      <a className={s.sticky__cta} href="#book">
        Check your date
      </a>
    </div>
  );
}
