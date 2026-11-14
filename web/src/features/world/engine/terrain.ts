/**
 * Superficie lunar generada por código: relieve suave, cráteres y colinas en
 * el horizonte. No se descarga ninguna malla; el color sale por vértice.
 */
import * as THREE from "three";

/** Generador pseudoaleatorio determinista (mismo paisaje en cada carga). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (x: number, z: number): number => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const vnoise = (x: number, z: number): number => {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

const fbm = (x: number, z: number, oct = 4): number => {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(x * f, z * f);
    amp *= 0.5;
    f *= 2.03;
  }
  return s;
};

interface Crater {
  x: number;
  z: number;
  r: number;
  d: number;
}

/** Zonas que se mantienen planas para apoyar los módulos (x, z, radio). */
export const FLAT_ZONES: [number, number, number][] = [
  [4, -2, 30],
  [-46, -18, 16],
];

export interface Terrain {
  mesh: THREE.Mesh;
  /** Altura del terreno (m) en un punto. */
  heightAt: (x: number, z: number) => number;
}

export function buildTerrain(): Terrain {
  const rnd = mulberry32(20260714);
  const craters: Crater[] = [];
  while (craters.length < 70) {
    const x = (rnd() - 0.5) * 520, z = (rnd() - 0.5) * 520;
    const r = 2.5 + Math.pow(rnd(), 2.4) * 30;
    const blocked = FLAT_ZONES.some(([fx, fz, fr]) => Math.hypot(x - fx, z - fz) < fr + r * 1.3);
    if (!blocked) craters.push({ x, z, r, d: r * (0.16 + rnd() * 0.1) });
  }

  const flatness = (x: number, z: number): number => {
    let f = 1;
    for (const [fx, fz, fr] of FLAT_ZONES) {
      const t = THREE.MathUtils.smoothstep(Math.hypot(x - fx, z - fz), fr * 0.7, fr * 1.5);
      f = Math.min(f, t);
    }
    return f;
  };

  const heightAt = (x: number, z: number): number => {
    const dist = Math.hypot(x, z);
    let h = (fbm(x * 0.012 + 7, z * 0.012 + 3) - 0.5) * 9 + (fbm(x * 0.07, z * 0.07, 3) - 0.5) * 1.1;
    for (const c of craters) {
      const t = Math.hypot(x - c.x, z - c.z) / c.r;
      if (t < 1.6) {
        const bowl = t < 1 ? -c.d * (1 - t * t) : 0;
        const rim = c.d * 0.32 * Math.exp(-Math.pow((t - 1) / 0.22, 2));
        h += bowl + rim;
      }
    }
    h *= flatness(x, z);
    // Colinas lejanas que cierran el horizonte
    const far = THREE.MathUtils.smoothstep(dist, 170, 300);
    h += far * (10 + 46 * Math.pow(fbm(x * 0.009 + 40, z * 0.009 - 12, 5), 1.6));
    return h;
  };

  const SIZE = 640, SEG = 220;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = heightAt(x, z);
    pos.setY(i, h);
    // Regolito: gris con vetas; más oscuro en zonas bajas y pisadas alrededor de la base.
    const n = fbm(x * 0.16, z * 0.16, 3);
    const mare = fbm(x * 0.006 - 3, z * 0.006 + 9, 3);
    let g = 0.2 + 0.13 * n + 0.07 * mare + THREE.MathUtils.clamp(h * 0.01, -0.06, 0.08);
    g *= 0.86 + 0.14 * flatness(x, z);
    col[i * 3] = g * 1.0;
    col[i * 3 + 1] = g * 0.985;
    col[i * 3 + 2] = g * 0.95;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return { mesh, heightAt };
}
