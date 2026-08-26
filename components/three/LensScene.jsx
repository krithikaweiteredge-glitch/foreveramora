'use client';

import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import { media } from '@/lib/media';
import CameraModel from './CameraModel';
import { prepTexture } from './materials';
import './materials';

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;

/** What the lens is holding — cross-fades from one memory to the next. */
function Inside({ textures }) {
  const [i, setI] = useState(0);
  const a = useRef(null);
  const b = useRef(null);
  const mix = useRef(0);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    mix.current += dt / 1.1;
    if (a.current) {
      a.current.uTime = t;
      a.current.uOpacity = damp(a.current.uOpacity, 1, 3, dt);
    }
    if (b.current) b.current.uTime = t;

    // swap every few seconds
    if (t > (i + 1) * 3.4) {
      setI((v) => v + 1);
    }
  });

  const cur = textures[i % textures.length];
  const prev = textures[(i + textures.length - 1) % textures.length];

  return (
    <group position={[0, 0, 0.62]}>
      <mesh>
        <planeGeometry args={[1.05, 1.05]} />
        <photoMaterial ref={b} uTex={prev} transparent uOpacity={1} uRadius={0.5} uGrain={0.03} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.05, 1.05]} />
        <photoMaterial ref={a} uTex={cur} transparent uOpacity={0} uRadius={0.5} uGrain={0.03} />
      </mesh>
    </group>
  );
}

export default function LensScene({ quality }) {
  const tier = quality?.tier ?? 'medium';
  const urls = useMemo(
    () => [media.lens, ...media.emotion.slice(0, tier === 'low' ? 3 : 6)],
    [tier]
  );
  const textures = useTexture(urls);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const pointer = useThree((s) => s.pointer);
  const rig = useRef(null);
  const open = useRef(0.2);

  useMemo(() => {
    textures.forEach((t) => prepTexture(t, Math.min(4, maxAniso)));
  }, [textures, maxAniso]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = rig.current;
    if (!g) return;

    // the barrel turns toward whoever is looking at it
    g.rotation.y = damp(g.rotation.y, pointer.x * 0.34, 2.4, dt);
    g.rotation.x = damp(g.rotation.x, -pointer.y * 0.26, 2.4, dt);
    g.position.y = damp(g.position.y, Math.sin(t * 0.38) * 0.04, 3, dt);

    // aperture opens as the cursor comes closer to the centre of the glass
    const d = clamp(Math.hypot(pointer.x, pointer.y), 0, 1);
    const target = 0.14 + (1 - d) * 0.82;
    open.current = damp(open.current, target, 3.4, dt);
  });

  return (
    <>
      <fog attach="fog" args={['#050506', 4.5, 12]} />
      <ambientLight intensity={0.2} color="#8ea3bb" />
      <pointLight position={[2.6, 1.8, 3.2]} intensity={26} color="#ffcf9a" distance={16} decay={2} />
      <pointLight position={[-3, -1.4, 2.4]} intensity={14} color="#6d90bb" distance={16} decay={2} />
      <spotLight position={[0, 3.4, 2.6]} angle={0.8} penumbra={1} intensity={20} color="#fff2de" />

      <Environment resolution={tier === 'low' ? 64 : 128} frames={1}>
        <Lightformer intensity={3} color="#ffd7a4" position={[0, 3, 3]} scale={[7, 2.4, 1]} />
        <Lightformer intensity={1.6} color="#7fa8cf" position={[-4, 0, 2]} scale={[3, 6, 1]} />
        <Lightformer intensity={2.2} color="#ffffff" position={[4, 0.6, 2]} scale={[2.4, 6, 1]} />
      </Environment>

      <group ref={rig} position={[0, 0, 0]} scale={1.55}>
        <CameraModel tier={tier} aperture={open.current}>
          <Inside textures={textures} />
        </CameraModel>
      </group>
    </>
  );
}
