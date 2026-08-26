'use client';

import Stage from '@/components/three/Stage';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { media } from '@/lib/media';
import s from './sections.module.css';
import LensScene from '@/components/three/LensScene';

export default function Lens() {
  return (
    <section className={`section ${s.lens}`} aria-labelledby="lens-h">
      <div className={s.lens__stage}>
        <Stage
          camera={{ position: [0, 0, 3.35], fov: 38, near: 0.1, far: 30 }}
          fallbackSrc={media.lens}
          fallbackAlt="Looking down the barrel of a lens"
        >
          {(q) => <LensScene quality={q} />}
        </Stage>
      </div>

      <div className={`wrap ${s.lens__copy}`}>
        <FadeUp as="p" className="eyebrow">
          Point of view
        </FadeUp>
        <MaskLines
          id="lens-h"
          className="display display--sm"
          lines={['See the world', 'through our lens.']}
          style={{ marginTop: '1.2rem' }}
        />
        <FadeUp className="lede" delay={0.12} style={{ marginTop: '1.8rem' }}>
          We look beyond posed photographs. We look for the glance, the tear, the
          laugh, the chaos, the silence — and everything in between.
        </FadeUp>
        <FadeUp className={s.lens__hint} delay={0.2}>
          <i />
          Move your cursor toward the glass
        </FadeUp>
      </div>
    </section>
  );
}
