'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { media } from '@/lib/media';
import { prepTexture } from './materials';
import './materials';

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;

/** Where each photograph hangs along the corridor. */
const STOPS = [
  { z: -10, x: 0.0, y: 0.0, rot: 0.0 },
  { z: -26, x: 1.5, y: -0.6, rot: -0.09 },
  { z: -42, x: -1.7, y: 0.7, rot: 0.1 },
  { z: -58, x: 0.4, y: -0.2, rot: -0.03 },
];

const TRAVEL = 64; // camera travel in world units across the whole scroll

function Plate({ tex, stop, index, progress }) {
  const ref = useRef(null);
  const mat = useRef(null);

  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const camZ = -progress.current * TRAVEL;
    const dist = stop.z - camZ; // negative once we are past it

    if (mat.current) {
      mat.current.uTime = t;
      // rise out of the dark, hold, then dissolve as the camera passes through
      const approach = clamp((22 + dist) / 14, 0, 1);
      const pass = clamp((dist + 3.5) / 7, 0, 1);
      mat.current.uOpacity = damp(mat.current.uOpacity, approach * pass, 9, dt);
      mat.current.uZoom = 1.04 + Math.sin(t * 0.2 + index) * 0.012;
    }

    // barely-there float so nothing feels pinned to a grid
    m.position.x = stop.x + Math.sin(t * 0.19 + index) * 0.13;
    m.position.y = stop.y + Math.cos(t * 0.15 + index) * 0.1;
    m.rotation.z = stop.rot + Math.sin(t * 0.11 + index) * 0.008;
  });

  return (
    <mesh ref={ref} position={[stop.x, stop.y, stop.z]} rotation={[0, 0, stop.rot]}>
      <planeGeometry args={[16, 9, 1, 1]} />
      <photoMaterial
        ref={mat}
        uTex={tex}
        transparent
        uOpacity={0}
        uGrain={0.05}
        uRadius={0.012}
        uFade={0.05}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Thin light bars that streak past — speed you can feel. */
function Streaks({ count = 26, progress }) {
  const ref = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 26,
        y: (Math.random() - 0.5) * 14,
        z: -Math.random() * TRAVEL - 4,
        s: 0.6 + Math.random() * 2.6,
      })),
    [count]
  );

  useFrame(() => {
    const inst = ref.current;
    if (!inst) return;
    const camZ = -progress.current * TRAVEL;
    seeds.forEach((sd, i) => {
      let z = sd.z;
      // recycle behind the camera so the corridor never runs out
      const span = TRAVEL + 20;
      z = ((z - camZ) % span) + camZ - span;
      dummy.position.set(sd.x, sd.y, z + span);
      dummy.scale.set(0.012, sd.s, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#c2a06a"
        transparent
        opacity={0.16}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export default function JourneyScene({ quality, progress }) {
  const b = quality?.budget ?? { particles: 800 };
  const textures = useTexture(media.film);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const camera = useThree((s) => s.camera);
  const pointer = useThree((s) => s.pointer);

  useMemo(() => {
    textures.forEach((t) => prepTexture(t, Math.min(4, maxAniso)));
  }, [textures, maxAniso]);

  useFrame((state, dt) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    camera.position.z = damp(camera.position.z, -p * TRAVEL, 8, dt);
    camera.position.x = damp(camera.position.x, pointer.x * 0.9 + Math.sin(t * 0.13) * 0.2, 1.8, dt);
    camera.position.y = damp(camera.position.y, -pointer.y * 0.6 + Math.cos(t * 0.1) * 0.15, 1.8, dt);
    camera.rotation.z = damp(camera.rotation.z, pointer.x * 0.02, 1.5, dt);
  });

  return (
    <>
      <fog attach="fog" args={['#050506', 6, 30]} />
      <ambientLight intensity={0.4} />
      {STOPS.map((stop, i) => (
        <Plate key={i} tex={textures[i % textures.length]} stop={stop} index={i} progress={progress} />
      ))}
      {b.particles > 0 && <Streaks count={quality?.tier === 'low' ? 12 : 26} progress={progress} />}
    </>
  );
}
