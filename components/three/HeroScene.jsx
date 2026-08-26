'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import { media } from '@/lib/media';
import CameraModel from './CameraModel';
import { prepTexture } from './materials';
import './materials';

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;

// one shared instance — a new Color per render would churn the uniform
const PRINT_TINT = new THREE.Color('#e8d9c2');

/** 0 → 1 across the hero's scroll runway. */
function heroProgress() {
  if (typeof window === 'undefined') return 0;
  return clamp(window.scrollY / window.innerHeight, 0, 1);
}

/** The cone of light the lens throws — projector, not spotlight. */
function useBeamTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 8;
    c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, 'rgba(255,224,178,0.55)');
    grad.addColorStop(0.55, 'rgba(255,214,160,0.10)');
    grad.addColorStop(1, 'rgba(255,210,150,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 8, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* ═══════════════ centrepiece: the camera, and what it sees ═══════════════ */
function Centrepiece({ tex, tier, scale = 0.74 }) {
  const rig = useRef(null);
  const bodyRig = useRef(null);
  const print = useRef(null);
  const mat = useRef(null);
  const beam = useRef(null);
  const pointer = useThree((s) => s.pointer);
  const beamTex = useBeamTexture();
  const aperture = useRef(0.55);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = heroProgress();
    const g = rig.current;
    if (!g) return;

    // three-quarter view that turns to follow the cursor
    const ry = -0.98 + pointer.x * 0.30 + Math.sin(t * 0.17) * 0.04;
    const rx = 0.14 + pointer.y * 0.16 + Math.cos(t * 0.21) * 0.025;
    g.rotation.y = damp(g.rotation.y, ry, 2.4, dt);
    g.rotation.x = damp(g.rotation.x, rx, 2.4, dt);
    g.position.y = damp(g.position.y, Math.sin(t * 0.4) * 0.06, 3, dt);

    // the aperture breathes open as the cursor closes in
    const near = 1 - clamp(Math.hypot(pointer.x, pointer.y), 0, 1);
    aperture.current = damp(aperture.current, 0.30 + near * 0.62 + p * 0.3, 3, dt);

    // scroll: the body falls back into the dark, the photograph comes at you
    if (bodyRig.current) {
      bodyRig.current.position.z = damp(bodyRig.current.position.z, -p * 9, 3.2, dt);
      bodyRig.current.rotation.z = damp(bodyRig.current.rotation.z, p * 0.24, 3, dt);
    }
    // Nothing sits in front of the camera at rest. The photograph is born out
    // of the lens the moment the visitor starts scrolling, and grows until it
    // is the only thing on screen.
    const born = clamp((p - 0.06) / 0.94, 0, 1);
    if (print.current) {
      print.current.visible = born > 0.001;
      print.current.position.x = damp(print.current.position.x, 0, 4, dt);
      print.current.position.y = damp(print.current.position.y, 0, 4, dt);
      print.current.position.z = damp(print.current.position.z, 1.55 + born * 3.4, 5, dt);
      const sc = 0.12 + born * born * 6.0;
      print.current.scale.setScalar(damp(print.current.scale.x, sc, 6, dt));
      print.current.rotation.y = damp(print.current.rotation.y, -g.rotation.y * (1 - born), 3, dt);
    }
    if (mat.current) {
      mat.current.uTime = t;
      mat.current.uOpacity = damp(mat.current.uOpacity, born, 7, dt);
      mat.current.uZoom = 1.05 + born * 0.1;
      mat.current.uHover = near * 0.4;
      mat.current.uRadius = 0.03 * (1 - born * 0.9);
      mat.current.uFade = 0.06 * (1 - born);
    }
    if (beam.current) {
      // a hint of light off the front element, never a wash across it
      beam.current.material.opacity = 0.24 * (1 - clamp(p / 0.4, 0, 1));
    }
  });

  return (
    <group ref={rig} scale={scale}>
      <group ref={bodyRig}>
        <CameraModel tier={tier} aperture={aperture.current} />

        {/* the beam, thrown from the front element */}
        <mesh ref={beam} position={[0, 0, 2.35]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.78, 2.3, 24, 1, true]} />
          <meshBasicMaterial
            map={beamTex}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* the memory the lens is holding */}
      <mesh ref={print} position={[0, 0, 1.55]} scale={0.12} visible={false}>
        <planeGeometry args={[1.5, 2.0, 1, 1]} />
        <photoMaterial
          ref={mat}
          uTex={tex}
          transparent
          uOpacity={0}
          uGrain={0.035}
          uRadius={0.03}
          uFade={0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════ suspended photographs ═══════════════ */
function FloatingPhoto({ tex, seed, position, rotation, scale }) {
  const ref = useRef(null);
  const mat = useRef(null);
  const pointer = useThree((s) => s.pointer);
  const base = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const m = ref.current;
    if (!m) return;
    const p = heroProgress();

    // suspended in time: drifting, never travelling
    m.position.x = damp(m.position.x, base.x + Math.sin(t * 0.23 + seed) * 0.16, 2, dt);
    m.position.y = damp(m.position.y, base.y + Math.cos(t * 0.19 + seed * 2) * 0.2, 2, dt);
    m.position.z = damp(m.position.z, base.z + Math.sin(t * 0.15 + seed) * 0.12, 2, dt);

    m.rotation.x = damp(m.rotation.x, rotation[0] + pointer.y * 0.16, 2.2, dt);
    m.rotation.y = damp(m.rotation.y, rotation[1] - pointer.x * 0.2, 2.2, dt);

    if (mat.current) {
      mat.current.uTime = t;
      // they clear the way as the camera pushes through
      const target = (1 - clamp(p / 0.5, 0, 1)) * (0.20 + 0.16 * Math.abs(Math.sin(seed)));
      mat.current.uOpacity = damp(mat.current.uOpacity, target, 5, dt);
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1.34, 1, 1]} />
      <photoMaterial
        ref={mat}
        uTex={tex}
        transparent
        uOpacity={0.22}
        uFade={0.1}
        uGrain={0.06}
        uRadius={0.03}
        uTint={PRINT_TINT}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ═══════════════ dust ═══════════════ */
function Dust({ count }) {
  const mat = useRef(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
      seed[i] = Math.random();
      scale[i] = 0.35 + Math.random() * 1.1;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count]);

  useFrame((s) => {
    if (mat.current) mat.current.uTime = s.clock.elapsedTime;
  });

  if (!count) return null;
  return (
    <points geometry={geo}>
      <dustMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uSize={7}
        uOpacity={0.42}
      />
    </points>
  );
}

/* ═══════════════ camera + light rig ═══════════════ */
function Rig({ target = [0, 0, 0] }) {
  const key = useRef(null);
  const pointer = useThree((s) => s.pointer);
  const camera = useThree((s) => s.camera);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = heroProgress();

    // pointer parallax at rest; on scroll the camera lines up with the print
    const tx = target[0] * p + pointer.x * 0.62 * (1 - p * 0.7) + Math.sin(t * 0.11) * 0.16;
    const ty = target[1] * p - pointer.y * 0.42 * (1 - p * 0.7) + Math.cos(t * 0.09) * 0.1;

    camera.position.x = damp(camera.position.x, tx, 1.6, dt);
    camera.position.y = damp(camera.position.y, ty, 1.6, dt);
    // the dolly through the photograph
    camera.position.z = damp(camera.position.z, 6.4 - p * 4.4, 2.2, dt);
    camera.lookAt(target[0] * (0.35 + p * 0.65), target[1] * (0.35 + p * 0.65), 0);

    if (key.current) {
      key.current.position.x = damp(key.current.position.x, pointer.x * 5, 2.4, dt);
      key.current.position.y = damp(key.current.position.y, pointer.y * 3.4, 2.4, dt);
    }
  });

  return (
    <>
      <ambientLight intensity={0.26} color="#8fa0b4" />
      {/* key: neutral, upper front-right — describes the form without tinting it */}
      <pointLight ref={key} position={[3.4, 3.2, 4.2]} intensity={58} color="#f2f6fc" distance={24} decay={2} />
      {/* rim: warm, behind and left — the edge that separates black from black */}
      <pointLight position={[-2.8, 2.1, -4.6]} intensity={62} color="#ffab55" distance={15} decay={2} />
      {/* a hard kick along the top plate and the prism */}
      <spotLight
        position={[0.4, 6, 1.8]}
        angle={0.8}
        penumbra={1}
        intensity={38}
        color="#ffffff"
        distance={26}
        decay={2}
      />
      {/* cool bounce so the underside is shadow, not a hole */}
      <pointLight position={[0, -3.4, 2.4]} intensity={9} color="#6f8fb8" distance={16} decay={2} />
    </>
  );
}

/* ═══════════════ scene ═══════════════ */
export default function HeroScene({ quality }) {
  const tier = quality?.tier ?? 'medium';
  const b = quality?.budget ?? { particles: 800, heroPhotos: 7 };
  const urls = useMemo(() => media.hero.slice(0, Math.max(1, b.heroPhotos + 1)), [b.heroPhotos]);
  const textures = useTexture(urls);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const width = useThree((s) => s.size.width);

  useMemo(() => {
    textures.forEach((t) => prepTexture(t, Math.min(4, maxAniso)));
  }, [textures, maxAniso]);

  // On wide screens the composition sits right of the headline; on phones it centres.
  // sits in the upper right, clear of the headline's line-endings
  const shiftX = width > 1280 ? 1.85 : width > 1024 ? 1.6 : width > 720 ? 0.95 : 0;
  const shiftY = width > 1024 ? 1.15 : width > 720 ? 0.85 : 1.2;
  const bodyScale = width > 1280 ? 0.74 : width > 1024 ? 0.66 : width > 720 ? 0.58 : 0.52;

  // A composed shell rather than a random scatter — controlled, not chaotic.
  const layout = useMemo(
    () => [
      { position: [-6.2, 1.4, -6.5], rotation: [0.04, 0.5, -0.05], scale: 2.2 },
      { position: [6.6, -1.2, -7.0], rotation: [-0.04, -0.5, 0.05], scale: 2.3 },
      { position: [-8.4, -1.8, -9.5], rotation: [0.03, 0.66, 0.05], scale: 2.9 },
      { position: [8.6, 2.0, -10.0], rotation: [-0.03, -0.68, -0.04], scale: 3.0 },
      { position: [-2.6, 3.9, -8.4], rotation: [-0.1, 0.18, 0.03], scale: 2.4 },
      { position: [3.4, -3.6, -8.0], rotation: [0.12, -0.2, -0.03], scale: 2.3 },
      { position: [0.2, 0.4, -12.5], rotation: [0, 0, 0.01], scale: 3.4 },
    ],
    []
  );

  return (
    <>
      <fog attach="fog" args={['#050506', 9, 28]} />
      <Rig target={[shiftX, shiftY, 0]} />

      {/* A local studio environment — no HDR downloads, just light shapes. */}
      <Environment resolution={tier === 'low' ? 64 : 128} frames={1}>
        {/* a softbox above, a strip either side — a real tabletop set */}
        <Lightformer intensity={2.1} color="#ffffff" position={[0, 4.5, 2.5]} scale={[8, 2.2, 1]} />
        <Lightformer intensity={1.7} color="#ffc07a" position={[-5.5, 1, -3.5]} scale={[2.4, 7, 1]} />
        <Lightformer intensity={1.7} color="#cfe0f2" position={[5, 1, 3]} scale={[1.6, 7, 1]} />
        <Lightformer intensity={0.45} color="#4b566b" position={[0, -4.5, 2]} scale={[9, 1.6, 1]} />
      </Environment>

      <group position={[shiftX, shiftY, 0]}>
        <Centrepiece tex={textures[0]} tier={tier} scale={bodyScale} />
      </group>

      {layout.slice(0, b.heroPhotos).map((l, i) => (
        <FloatingPhoto
          key={i}
          tex={textures[(i + 1) % textures.length]}
          seed={i * 1.7 + 0.4}
          position={l.position}
          rotation={l.rotation}
          scale={l.scale}
        />
      ))}

      <Dust count={b.particles} />
    </>
  );
}
