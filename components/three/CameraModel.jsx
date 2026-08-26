'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

/**
 * A full-frame body with a fast prime on the front, built entirely from
 * geometry — no model download, no loading spinner, and it re-lights itself
 * from whatever environment the scene provides.
 *
 * Lens points down +Z, so the parent can simply face it at the viewer.
 */

/* ── materials, made once and shared by every part ─────────── */
export function useKit(tier = 'medium') {
  return useMemo(() => {
    const body = new THREE.MeshStandardMaterial({
      color: '#0a0a0c',
      roughness: 0.52,
      metalness: 0.30,
      envMapIntensity: 0.30,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: '#070708',
      roughness: 0.96,
      metalness: 0.02,
      envMapIntensity: 0.5,
    });
    const metal = new THREE.MeshStandardMaterial({
      color: '#8d9095',
      roughness: 0.24,
      metalness: 1,
      envMapIntensity: 0.85,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: '#101013',
      roughness: 0.36,
      metalness: 0.7,
      envMapIntensity: 0.55,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: '#c2a06a',
      roughness: 0.2,
      metalness: 1,
      envMapIntensity: 1.25,
    });
    const ridge = new THREE.MeshStandardMaterial({
      color: '#242429',
      roughness: 0.55,
      metalness: 0.55,
      envMapIntensity: 0.7,
    });
    const blade = new THREE.MeshStandardMaterial({
      color: '#0a0b0d',
      roughness: 0.72,
      metalness: 0.35,
      envMapIntensity: 0.45,
      side: THREE.DoubleSide,
    });
    const cavity = new THREE.MeshStandardMaterial({
      color: '#050506',
      roughness: 0.95,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: '#0b141a',
      roughness: 0.05,
      metalness: 0.4,
      transparent: true,
      opacity: 0.65,
      envMapIntensity: 1.0,
    });
    return { body, rubber, metal, dark, gold, ridge, blade, cavity, glass };
  }, [tier]);
}

/* ── the knurling on the focus and zoom rings ──────────────── */
function Knurl({ radius, height, z, count = 46, mat }) {
  const ref = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // positions never change, so the matrices are written once on mount
  const onRef = (inst) => {
    ref.current = inst;
    if (!inst) return;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, z);
      dummy.rotation.set(0, 0, a);
      dummy.scale.set(0.012, 0.03, height);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  };

  return (
    <instancedMesh ref={onRef} args={[undefined, undefined, count]} material={mat}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

/* ── aperture ──────────────────────────────────────────────── */
function bladeShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.quadraticCurveTo(0.62, -0.44, 0.78, 0.06);
  s.quadraticCurveTo(0.5, 0.4, -0.05, 0.5);
  s.quadraticCurveTo(-0.16, 0.0, 0, -0.5);
  return s;
}

export function Aperture({ open = 0.6, blades = 9, z = 0.86, mat }) {
  const group = useRef(null);
  const geo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(bladeShape(), {
        depth: 0.012,
        bevelEnabled: false,
        curveSegments: 8,
      }),
    []
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const val = typeof open === 'object' && open !== null && 'current' in open ? open.current : open;
    const o = THREE.MathUtils.clamp(val, 0, 1);
    g.children.forEach((child, i) => {
      const pivot = child;
      pivot.rotation.z = (i / blades) * Math.PI * 2;
      const arm = pivot.children[0];
      // stays inside the 0.42 cavity at every opening
      arm.position.x = 0.045 + o * 0.165;
      arm.rotation.z = -0.78 + o * 0.98;
      arm.scale.setScalar(0.26);
    });
  });

  return (
    <group ref={group} position={[0, 0, z]}>
      {Array.from({ length: blades }).map((_, i) => (
        <group key={i}>
          <mesh geometry={geo} material={mat} />
        </group>
      ))}
    </group>
  );
}

/* ── the camera ────────────────────────────────────────────── */
export default function CameraModel({
  tier = 'medium',
  aperture = 0.62,
  showAperture = true,
  recording = true,
  children,
}) {
  const k = useKit(tier);
  const led = useRef(null);
  const seg = tier === 'low' ? 24 : 48;

  useFrame((state) => {
    if (led.current && recording) {
      const t = state.clock.elapsedTime;
      led.current.material.emissiveIntensity = 1.6 + Math.sin(t * 2.4) * 1.1;
    }
  });

  return (
    <group>
      {/* ── body ── */}
      <RoundedBox args={[2.05, 1.42, 0.8]} radius={0.13} smoothness={4} material={k.body} />

      {/* rubberised front cladding, left of the mount */}
      <RoundedBox
        args={[0.52, 1.16, 0.16]}
        radius={0.06}
        smoothness={3}
        position={[-0.74, 0, 0.36]}
        material={k.rubber}
      />

      {/* ── grip ── */}
      <RoundedBox
        args={[0.46, 1.42, 0.98]}
        radius={0.2}
        smoothness={4}
        position={[0.92, -0.02, 0.06]}
        material={k.rubber}
      />

      {/* ── pentaprism + hot shoe ── */}
      <RoundedBox
        args={[0.66, 0.4, 0.62]}
        radius={0.07}
        smoothness={3}
        position={[-0.16, 0.8, -0.02]}
        material={k.body}
      />
      <mesh position={[-0.16, 1.02, -0.02]} material={k.metal}>
        <boxGeometry args={[0.36, 0.05, 0.3]} />
      </mesh>
      <mesh position={[-0.16, 1.05, -0.02]} material={k.dark}>
        <boxGeometry args={[0.26, 0.03, 0.22]} />
      </mesh>

      {/* ── top plate details ── */}
      <mesh position={[0.86, 0.72, 0.2]} rotation={[Math.PI / 2, 0, 0]} material={k.metal}>
        <cylinderGeometry args={[0.11, 0.11, 0.06, seg]} />
      </mesh>
      <mesh position={[0.4, 0.76, -0.1]} rotation={[Math.PI / 2, 0, 0]} material={k.dark}>
        <cylinderGeometry args={[0.19, 0.19, 0.1, seg]} />
      </mesh>
      <group position={[0.4, 0.76, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <Knurl radius={0.19} height={0.1} z={0} count={30} mat={k.metal} />
      </group>
      <mesh position={[-0.72, 0.74, -0.06]} rotation={[Math.PI / 2, 0, 0]} material={k.dark}>
        <cylinderGeometry args={[0.16, 0.16, 0.09, seg]} />
      </mesh>

      {/* engraved accent line along the top */}
      <mesh position={[-0.16, 0.6, 0.4]} material={k.gold}>
        <boxGeometry args={[1.0, 0.012, 0.012]} />
      </mesh>

      {/* ── strap lugs ── */}
      {[-1.06, 1.06].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} material={k.metal}>
          <torusGeometry args={[0.075, 0.022, 8, 20]} />
        </mesh>
      ))}

      {/* ── rec light ── */}
      <mesh ref={led} position={[-0.62, 0.5, 0.41]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial
          color="#5a0d0d"
          emissive="#ff2d2d"
          emissiveIntensity={2}
          roughness={0.3}
        />
      </mesh>

      {/* ── viewfinder eyepiece: the detail that says "camera" fastest ── */}
      <RoundedBox
        args={[0.36, 0.26, 0.14]}
        radius={0.04}
        smoothness={3}
        position={[-0.16, 0.74, -0.36]}
        material={k.rubber}
      />
      <mesh position={[-0.16, 0.74, -0.43]} rotation={[Math.PI / 2, 0, 0]} material={k.cavity}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, seg]} />
      </mesh>

      {/* ── rear screen ── */}
      <mesh position={[-0.1, -0.02, -0.41]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.16, 0.86]} />
        <meshStandardMaterial
          color="#05070a"
          emissive="#1d2b3a"
          emissiveIntensity={0.55}
          roughness={0.14}
          metalness={0.2}
        />
      </mesh>

      {/* ══════════ LENS — a fast prime, roughly 1.5× the body's depth ══════════ */}
      {/* bayonet mount + the white index dot you line up when you fit a lens */}
      <mesh position={[0, 0, 0.44]} rotation={[Math.PI / 2, 0, 0]} material={k.metal}>
        <cylinderGeometry args={[0.55, 0.55, 0.09, seg]} />
      </mesh>
      <mesh position={[0, 0.5, 0.47]} material={k.metal}>
        <boxGeometry args={[0.05, 0.09, 0.02]} />
      </mesh>

      {/* the step down from mount to barrel */}
      <mesh position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]} material={k.dark}>
        <cylinderGeometry args={[0.5, 0.53, 0.09, seg]} />
      </mesh>

      {/* aperture ring — narrow, finely knurled */}
      <mesh position={[0, 0, 0.68]} rotation={[Math.PI / 2, 0, 0]} material={k.dark}>
        <cylinderGeometry args={[0.5, 0.5, 0.18, seg]} />
      </mesh>
      <Knurl radius={0.503} height={0.15} z={0.68} count={tier === 'low' ? 30 : 64} mat={k.ridge} />

      {/* distance-scale window: a thin engraved band */}
      <mesh position={[0, 0, 0.83]} rotation={[Math.PI / 2, 0, 0]} material={k.metal}>
        <cylinderGeometry args={[0.495, 0.495, 0.05, seg]} />
      </mesh>
      <mesh position={[0, 0, 0.83]} material={k.gold}>
        <torusGeometry args={[0.5, 0.006, 8, seg]} />
      </mesh>

      {/* focus ring — the wide one */}
      <mesh position={[0, 0, 1.04]} rotation={[Math.PI / 2, 0, 0]} material={k.dark}>
        <cylinderGeometry args={[0.505, 0.5, 0.36, seg]} />
      </mesh>
      <Knurl radius={0.508} height={0.32} z={1.04} count={tier === 'low' ? 32 : 72} mat={k.ridge} />

      {/* front barrel, filter thread, and the one gold band */}
      <mesh position={[0, 0, 1.29]} rotation={[Math.PI / 2, 0, 0]} material={k.dark}>
        <cylinderGeometry args={[0.53, 0.505, 0.16, seg]} />
      </mesh>
      <mesh position={[0, 0, 1.355]} material={k.gold}>
        <torusGeometry args={[0.518, 0.011, 10, seg]} />
      </mesh>
      <mesh position={[0, 0, 1.36]} rotation={[Math.PI / 2, 0, 0]} material={k.metal}>
        <cylinderGeometry args={[0.5, 0.5, 0.03, seg, 1, true]} />
      </mesh>

      {/* barrel interior — the dark tunnel behind the glass */}
      <mesh position={[0, 0, 0.95]} rotation={[Math.PI / 2, 0, 0]} material={k.cavity}>
        <cylinderGeometry args={[0.44, 0.3, 0.85, seg, 1, true]} />
      </mesh>
      {[0.66, 0.8, 0.94, 1.08].map((z, i) => (
        <mesh key={z} position={[0, 0, z]} material={k.metal}>
          <torusGeometry args={[0.38 - i * 0.022, 0.005, 6, seg]} />
        </mesh>
      ))}

      {showAperture && (
        <Aperture open={aperture} blades={tier === 'low' ? 7 : 9} z={0.95} mat={k.blade} />
      )}

      {/* what the lens is looking at — a photograph, a scene, anything */}
      {children}

      {/* front element: a shallow dome, set back inside the filter thread */}
      <mesh position={[0, 0, 1.2]} rotation={[-Math.PI / 2, 0, 0]} material={k.glass}>
        <sphereGeometry args={[0.5, seg, Math.round(seg / 2), 0, Math.PI * 2, 0, Math.PI * 0.4]} />
      </mesh>

      {/* the coating: a narrow crescent of colour, not a lit disc */}
      <mesh position={[-0.16, 0.17, 1.31]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.5]}>
        <sphereGeometry
          args={[0.42, seg, 14, Math.PI * 0.15, Math.PI * 0.55, 0, Math.PI * 0.34]}
        />
        <meshBasicMaterial
          color="#79b39a"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
