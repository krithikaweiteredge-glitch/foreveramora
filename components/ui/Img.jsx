'use client';

import { useRef, useState } from 'react';
import { srcSet, SMALL } from '@/lib/media';

/**
 * Every raster image on the site goes through here:
 * lazy by default, srcset from the generated width variants,
 * JPG fallback via <picture>, and a soft fade once decoded.
 */
export default function Img({
  src,
  alt = '',
  widths = [SMALL],
  sizes = '100vw',
  priority = false,
  className = '',
  style,
  parallax = 0,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  const jpg = src.replace(/\.webp$/, '.jpg');

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet(src, widths)} sizes={sizes} />
      <img
        ref={ref}
        src={jpg}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        data-loaded={loaded}
        data-parallax={parallax || undefined}
        className={`img-fade ${className}`}
        style={style}
        {...rest}
      />
    </picture>
  );
}
