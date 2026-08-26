'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

/**
 * The only module that imports @react-three/fiber at the top level.
 *
 * Stage loads this with `ssr: false`, which keeps three.js and R3F out of the
 * server bundle entirely — they are browser-only libraries, and pulling them
 * into the prerender breaks the static export.
 */
export default function CanvasHost({
  camera,
  dpr,
  frameloop,
  antialias,
  onLost,
  children,
}) {
  return (
    <Canvas
      camera={camera}
      dpr={dpr}
      frameloop={frameloop}
      gl={{
        antialias,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onLost?.();
        });
      }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
