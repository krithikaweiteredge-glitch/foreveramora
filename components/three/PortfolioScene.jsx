'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { stories } from '@/lib/content';
import { prepTexture } from './materials';
import './materials';

const damp = THREE.MathUtils.damp;
const GAP = 2.42;
const DEPTH = 0.95;
const CURVE = 0.3;

/** Shortest signed distance from slot i to the current position, wrapped. */
function wrap(offset, n) {
  let o = offset;
  while (o > n / 2) o -= n;
  while (o < -n / 2) o += n;
  return o;
}

function Card({ tex, index, drive, count }) {
  const mesh = useRef(null);
  const mat = useRef(null);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const o = wrap(index - drive.scroll, count);
    const a = Math.abs(o);

    m.position.x = damp(m.position.x, o * GAP, 12, dt);
    m.position.z = damp(m.position.z, -Math.min(7, Math.pow(a, 1.35) * DEPTH), 12, dt);
    m.position.y = damp(m.position.y, Math.sin(t * 0.4 + index) * 0.045, 3, dt);
    m.rotation.y = damp(m.rotation.y, -o * CURVE, 12, dt);
    m.rotation.z = damp(m.rotation.z, o * 0.012, 8, dt);

    const focus = Math.max(0, 1 - a);
    const sc = 1 + focus * 0.2 - Math.min(0.3, a * 0.07);
    m.scale.setScalar(damp(m.scale.x, sc, 10, dt));
    m.visible = a < count / 2 - 0.2;

    if (mat.current) {
      mat.current.uTime = t;
      mat.current.uOpacity = damp(
        mat.current.uOpacity,
        Math.max(0.06, 1 - a * 0.3),
        8,
        dt
      );
      mat.current.uHover = damp(mat.current.uHover, focus * 0.85, 6, dt);
      mat.current.uVel = damp(mat.current.uVel, Math.min(0.9, Math.abs(drive.vel) * 5), 6, dt);
      mat.current.uBend = 0.16;
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2.5, 1.72, 24, 1]} />
      <photoMaterial
        ref={mat}
        uTex={tex}
        transparent
        uOpacity={0}
        uRadius={0.018}
        uGrain={0.04}
        uFade={0.02}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function PortfolioScene({ quality, drive }) {
  const urls = useMemo(() => stories.map((s) => s.cover), []);
  const textures = useTexture(urls);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const camera = useThree((s) => s.camera);
  const pointer = useThree((s) => s.pointer);

  useMemo(() => {
    textures.forEach((t) => prepTexture(t, Math.min(4, maxAniso)));
  }, [textures, maxAniso]);

  useFrame((state, dt) => {
    // inertia, then a gentle magnet toward the nearest story
    if (!drive.dragging) {
      drive.vel *= Math.pow(0.94, dt * 60);
      const snap = Math.round(drive.scroll);
      const pull = (snap - drive.scroll) * 0.10;
      if (Math.abs(drive.vel) < 0.0022) drive.vel += pull * dt * 60 * 0.06;
    }
    drive.scroll += drive.vel;
    if (Math.abs(drive.vel) < 0.00004) drive.vel = 0;

    drive.index = ((Math.round(drive.scroll) % stories.length) + stories.length) % stories.length;
    drive.onIndex?.(drive.index);

    camera.position.x = damp(camera.position.x, pointer.x * 0.35, 2, dt);
    camera.position.y = damp(camera.position.y, -pointer.y * 0.22, 2, dt);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <fog attach="fog" args={['#08080a', 5, 16]} />
      <ambientLight intensity={0.5} />
      {textures.map((tex, i) => (
        <Card key={i} tex={tex} index={i} drive={drive} count={stories.length} />
      ))}
    </>
  );
}
