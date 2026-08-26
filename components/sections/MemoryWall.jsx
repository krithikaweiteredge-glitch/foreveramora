'use client';

import Stage from '@/components/three/Stage';
import Img from '@/components/ui/Img';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { media } from '@/lib/media';
import { studio } from '@/lib/studio';
import s from './sections.module.css';
import WallScene from '@/components/three/WallScene';

export default function MemoryWall() {
  return (
    <section className={s.wall} aria-labelledby="wall-h">
      <div className={s.wall__stage}>
        <Stage
          camera={{ position: [0, 0, 5.6], fov: 46, near: 0.1, far: 40 }}
          fallbackSrc={media.wall[0]}
          fallbackAlt="A wall of small photographs"
        >
          {(q) => <WallScene quality={q} />}
        </Stage>

        {/* the graceful degradation for reduced motion / no WebGL */}
        <div className={s.wall__static} aria-hidden>
          {media.wall.slice(0, 24).map((w) => (
            <Img key={w} src={w} alt="" sizes="12vw" />
          ))}
        </div>
      </div>

      <div className={`wrap ${s.wall__copy}`}>
        <FadeUp as="p" className="eyebrow">
          The archive
        </FadeUp>
        <MaskLines
          id="wall-h"
          className="display display--sm"
          lines={['Nothing here', 'gets deleted.']}
          style={{ marginTop: '1.2rem' }}
        />
        <FadeUp className="lede" delay={0.1} style={{ marginTop: '1.5rem' }}>
          Every frame we have ever shot lives on three drives in two cities. Some
          of these people are married now. Some of them are gone. All of them are
          still here.
        </FadeUp>
        <FadeUp className={s.wall__hint} delay={0.18}>
          <i />
          Hover a frame · click to bring it forward
        </FadeUp>
      </div>

      <div className={s.wall__stat} aria-hidden>
        <span className="num">{studio.figures[3].value}</span>
        <em>{studio.figures[3].label}</em>
      </div>
    </section>
  );
}
