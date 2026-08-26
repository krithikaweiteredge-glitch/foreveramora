'use client';

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

/* ═══════════════════════════════════════════════════════════
   PhotoMaterial
   Every photograph in 3D is drawn with this: rounded corners,
   a warm edge light, a per-print vignette, a whisper of RGB
   separation that grows with drag velocity, and film grain.
   ═══════════════════════════════════════════════════════════ */

const PhotoMaterial = shaderMaterial(
  {
    uTex: null,
    uTime: 0,
    uOpacity: 1,
    uHover: 0,
    uVel: 0,
    uRadius: 0.035,
    uGrain: 0.05,
    uFade: 0.0,
    uZoom: 1.0,
    uBend: 0.0,
    uTint: new THREE.Color('#ffffff'),
  },
  /* vertex */ `
    uniform float uBend;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z -= uBend * (1.0 - cos(p.x * 0.30)) * 3.2;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  /* fragment */ `
    uniform sampler2D uTex;
    uniform float uTime, uOpacity, uHover, uVel, uRadius, uGrain, uFade, uZoom;
    uniform vec3 uTint;
    varying vec2 vUv;

    float rrect(vec2 uv, float r) {
      vec2 p = abs(uv - 0.5) - (0.5 - r);
      return length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - r;
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      // a slow push-in that deepens on hover
      float z = uZoom - 0.05 * uHover;
      vec2 uv = (vUv - 0.5) / z + 0.5;

      // chromatic separation — barely there at rest, alive when dragged
      vec2 dir = normalize(vUv - 0.5 + vec2(1e-5));
      float amt = 0.0016 + uVel * 0.020 + uHover * 0.0035;

      vec3 col = vec3(
        texture2D(uTex, uv + dir * amt).r,
        texture2D(uTex, uv).g,
        texture2D(uTex, uv - dir * amt).b
      );

      col *= uTint;
      col *= 0.80 + 0.55 * uHover;

      // each print sits in its own pool of light
      float vig = smoothstep(0.92, 0.22, length(vUv - 0.5));
      col *= mix(0.66, 1.06, vig);

      float d = rrect(vUv, uRadius);

      // warm rim, like light catching the edge of a physical print
      float edge = smoothstep(0.010, 0.0, abs(d));
      col += vec3(0.78, 0.63, 0.40) * edge * (0.12 + 0.55 * uHover);

      float mask = smoothstep(0.0035, -0.0035, d);

      // optional dissolve so distant frames melt into the dark
      float m = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
      float fade = 1.0 - smoothstep(0.5 - uFade, 0.5, m);
      mask *= mix(1.0, fade, step(0.001, uFade));

      col += (hash(vUv * 820.0 + fract(uTime * 0.35)) - 0.5) * uGrain;

      float a = uOpacity * mask;
      if (a < 0.004) discard;
      gl_FragColor = vec4(col, a);
      #include <colorspace_fragment>
    }
  `
);

/* ═══════════════════════════════════════════════════════════
   DustMaterial — the drifting motes in the studio air.
   ═══════════════════════════════════════════════════════════ */

const DustMaterial = shaderMaterial(
  { uTime: 0, uSize: 12, uOpacity: 1, uColor: new THREE.Color('#e0c79b') },
  /* vertex */ `
    uniform float uTime, uSize;
    attribute float aSeed;
    attribute float aScale;
    varying float vTwinkle;
    void main() {
      vec3 p = position;
      float t = uTime * 0.12 + aSeed * 6.2831;
      p.x += sin(t * 0.9) * 0.7;
      p.y += cos(t * 0.7) * 0.5 + mod(uTime * 0.06 + aSeed, 2.0) - 1.0;
      p.z += sin(t * 0.5) * 0.5;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vTwinkle = 0.35 + 0.65 * pow(abs(sin(t * 1.7)), 2.0);
      gl_PointSize = uSize * aScale * (18.0 / max(0.2, -mv.z));
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* fragment */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vTwinkle;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.03, d);
      a *= a;
      gl_FragColor = vec4(uColor, a * vTwinkle * uOpacity);
      if (gl_FragColor.a < 0.005) discard;
      #include <colorspace_fragment>
    }
  `
);

/* ═══════════════════════════════════════════════════════════
   GlassMaterial — cheap fresnel dome for the lens element.
   Real transmission is reserved for the high tier.
   ═══════════════════════════════════════════════════════════ */

const GlassMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#cfe0ea'), uPower: 2.4, uOpacity: 0.5 },
  /* vertex */ `
    varying vec3 vN;
    varying vec3 vV;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* fragment */ `
    uniform vec3 uColor;
    uniform float uPower, uOpacity, uTime;
    varying vec3 vN;
    varying vec3 vV;
    void main() {
      float f = pow(1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
      vec3 col = mix(uColor * 0.18, vec3(1.0, 0.92, 0.78), f);
      gl_FragColor = vec4(col, clamp(f * 1.25, 0.0, 1.0) * uOpacity);
      #include <colorspace_fragment>
    }
  `
);

extend({ PhotoMaterial, DustMaterial, GlassMaterial });

export { PhotoMaterial, DustMaterial, GlassMaterial };

/* ── texture loading, tuned once ────────────────────────────── */

export function prepTexture(t, maxAniso = 2) {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(2, maxAniso);
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}
