'use client';

import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { media } from '@/lib/media';
import { prepTexture } from './materials';
import './materials';

const damp = THREE.MathUtils.damp;

/**
 * A wall of memories: a curved grid, drifting gently. Hovering lifts a frame
 * out; clicking brings it to the front. Composed, never chaotic.
 */
function useLayout(count) {
  return useMemo(() => {
    const cols = count > 40 ? 8 : count > 26 ? 7 : 5;
    const rows = Math.ceil(count / cols);
    const R = 9.5;
    const step = 0.152;
    const vgap = 1.18;
    const rand = (seed) => {
      const x = Math.sin(seed * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const a = (col - (cols - 1) / 2) * step + (rand(i) - 0.5) * 0.02;
      const y =
        (row - (rows - 1) / 2) * vgap +
        (rand(i + 99) - 0.5) * 0.24 +
        (col % 2 ? 0.16 : -0.16);
      return {
        pos: [Math.sin(a) * R, y, Math.cos(a) * R - R + (rand(i + 7) - 0.5) * 0.5],
        rotY: -a,
        seed: rand(i + 31) * 6.28,
        scale: 0.86 + rand(i + 55) * 0.3,
      };
    });
  }, [count]);
}

function Tile({ tex, slot, i, focused, setFocused }) {
  const mesh = useRef(null);
  const mat = useRef(null);
  const isHoverRef = useRef(false);
  const isFocus = focused === i;

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const isHover = isHoverRef.current;

    const drift = [
      Math.sin(t * 0.16 + slot.seed) * 0.07,
      Math.cos(t * 0.13 + slot.seed) * 0.09,
      Math.sin(t * 0.1 + slot.seed) * 0.05,
    ];

    let tx = slot.pos[0] + drift[0];
    let ty = slot.pos[1] + drift[1];
    let tz = slot.pos[2] + drift[2];
    let ts = slot.scale;
    let ry = slot.rotY;

    if (isFocus) {
      tx = 0;
      ty = 0;
      tz = 3.05;
      ts = 2.35;
      ry = 0;
    } else if (isHover) {
      tz += 0.55;
      ts *= 1.22;
    } else if (focused !== null) {
      // everything else steps back and out of the light
      tz -= 0.8;
      ts *= 0.94;
    }

    m.position.x = damp(m.position.x, tx, isFocus ? 5 : 3, dt);
    m.position.y = damp(m.position.y, ty, isFocus ? 5 : 3, dt);
    m.position.z = damp(m.position.z, tz, isFocus ? 5 : 4, dt);
    m.scale.setScalar(damp(m.scale.x, ts, 6, dt));
    m.rotation.y = damp(m.rotation.y, ry, 4, dt);
    m.rotation.z = damp(m.rotation.z, isFocus ? 0 : Math.sin(t * 0.09 + slot.seed) * 0.02, 3, dt);

    if (mat.current) {
      mat.current.uTime = t;
      const target = isFocus ? 1 : focused !== null ? 0.16 : isHover ? 1 : 0.62;
      mat.current.uOpacity = damp(mat.current.uOpacity, target, 6, dt);
      mat.current.uHover = damp(mat.current.uHover, isFocus || isHover ? 1 : 0, 6, dt);
    }
  });

  return (
    <mesh
      ref={mesh}
      position={slot.pos}
      rotation={[0, slot.rotY, 0]}
      renderOrder={isFocus ? 10 : 0}
      onPointerOver={(e) => {
        e.stopPropagation();
        isHoverRef.current = true;
      }}
      onPointerOut={() => {
        isHoverRef.current = false;
      }}
      onClick={(e) => {
        e.stopPropagation();
        setFocused(isFocus ? null : i);
      }}
    >
      <planeGeometry args={[0.78, 0.98, 1, 1]} />
      <photoMaterial
        ref={mat}
        uTex={tex}
        transparent
        uOpacity={0}
        uRadius={0.03}
        uGrain={0.05}
        uFade={0.03}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function WallScene({ quality, onFocus }) {
  const count = quality?.budget?.wall ?? 34;
  const urls = useMemo(() => media.wall.slice(0, count), [count]);
  const textures = useTexture(urls);
  const layout = useLayout(count);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const pointer = useThree((s) => s.pointer);
  const camera = useThree((s) => s.camera);
  const [focused, setFocused] = useState(null);

  useMemo(() => {
    textures.forEach((t) => prepTexture(t, Math.min(4, maxAniso)));
  }, [textures, maxAniso]);

  useFrame((state, dt) => {
    // the wall leans with the cursor — a room you are standing in
    const k = focused !== null ? 0.1 : 1;
    camera.position.x = damp(camera.position.x, pointer.x * 1.15 * k, 1.6, dt);
    camera.position.y = damp(camera.position.y, -pointer.y * 0.7 * k, 1.6, dt);
    camera.lookAt(0, 0, 0);
  });

  const pick = (i) => {
    setFocused(i);
    onFocus?.(i);
  };

  return (
    <>
      <fog attach="fog" args={['#08080a', 4, 15]} />
      <ambientLight intensity={0.6} />
      {/* clicking the empty dark releases the focused frame */}
      <mesh position={[0, 0, -6]} onClick={() => pick(null)}>
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {textures.map((tex, i) => (
        <Tile
          key={i}
          i={i}
          tex={tex}
          slot={layout[i]}
          focused={focused}
          setFocused={pick}
        />
      ))}
    </>
  );
}
