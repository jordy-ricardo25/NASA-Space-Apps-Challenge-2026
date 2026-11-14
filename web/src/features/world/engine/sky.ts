/**
 * Cielo del centro de mando: estrellas, la Tierra (Blue Marble de NASA) con su
 * atmósfera, y la luz del Sol rasante sobre la superficie lunar.
 */
import * as THREE from "three";
import { mulberry32 } from "./terrain";

export const SUN_DIR = new THREE.Vector3(-0.62, 0.36, 0.7).normalize();
export const EARTH_POS = new THREE.Vector3(150, 172, -650);

export function buildStars(): THREE.Points {
  const rnd = mulberry32(77);
  const N = 3200;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, r = Math.sqrt(1 - u * u);
    pos[i * 3] = 1400 * r * Math.cos(th);
    pos[i * 3 + 1] = 1400 * Math.abs(u) * 0.98 + 10;
    pos[i * 3 + 2] = 1400 * r * Math.sin(th);
    const b = 0.35 + 0.65 * Math.pow(rnd(), 3);
    const tint = rnd();
    col[i * 3] = b * (0.85 + 0.15 * tint);
    col[i * 3 + 1] = b * 0.92;
    col[i * 3 + 2] = b * (1 - 0.12 * tint);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

/** Tierra con textura Blue Marble y halo atmosférico. */
export function buildEarth(map: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  const R = 74;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(R, 64, 40),
    new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0, emissive: 0x0a1c33, emissiveIntensity: 0.35 }),
  );
  earth.rotation.set(0.35, -1.9, 0.18);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.045, 48, 32),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uSun: { value: SUN_DIR.clone() } },
      vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vW; uniform vec3 uSun;
        void main(){ vec3 v = normalize(cameraPosition - vW); float rim = pow(1.0 - abs(dot(v, vN)), 2.2);
          float lit = smoothstep(-0.35, 0.5, dot(-vN, uSun)); gl_FragColor = vec4(vec3(0.3,0.62,1.0) * rim * (0.25 + lit) * 1.6, rim); }`,
    }),
  );
  g.add(earth, halo);
  g.position.copy(EARTH_POS);
  g.userData.spin = earth;
  return g;
}

export interface Lights {
  sun: THREE.DirectionalLight;
  fill: THREE.HemisphereLight;
}

export function buildLights(shadows: boolean): Lights {
  const sun = new THREE.DirectionalLight(0xfff3e2, 3.1);
  sun.position.copy(SUN_DIR).multiplyScalar(160);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = shadows;
  sun.shadow.mapSize.set(2048, 2048);
  const c = sun.shadow.camera;
  c.left = -70;
  c.right = 46;
  c.top = 52;
  c.bottom = -46;
  c.near = 40;
  c.far = 320;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.06;
  // Luz de relleno: brillo de la Tierra y rebote del regolito
  const fill = new THREE.HemisphereLight(0x9fc0ea, 0x3a342c, 0.62);
  return { sun, fill };
}
