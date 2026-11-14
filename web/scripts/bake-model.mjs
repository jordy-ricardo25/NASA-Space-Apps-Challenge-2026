/**
 * bake-model.mjs — Convierte un GLB de NASA-3D-Resources en un binario web ligero.
 *
 * Misma estrategia que la Alpha (ISS: 96 MB → 322 KB):
 *   1. Leer el GLB (Draco / Meshopt incluidos) y aplicar las transformaciones de cada nodo.
 *   2. Pasar las texturas a color por vértice (no se carga ninguna imagen en el navegador).
 *   3. Soldar vértices, simplificar con meshoptimizer hasta un presupuesto de triángulos.
 *   4. Cuantizar (posición 16 bits, color 8 bits), codificar por diferencias y comprimir con gzip.
 *
 * Uso:
 *   node scripts/bake-model.mjs <entrada.glb> <nombre> [--tris 12000] [--tex 128] [--min 0.004]
 *        [--groups "id1=regex1;id2=regex2"] [--gray] [--inspect]
 *
 * Salida: public/models/<nombre>.bin.gz y public/models/<nombre>.meta.json
 * El cargador del navegador está en src/features/world/engine/modelLoader.ts
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import { MeshoptSimplifier, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const input = args[0];
const name = args[1];
if (!input || !name) {
  console.error("Uso: node scripts/bake-model.mjs <entrada.glb> <nombre> [opciones]");
  process.exit(1);
}
const opt = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const has = (flag) => args.includes(flag);
const TRIS = +opt("--tris", 12000);
const TEX = +opt("--tex", 128);
const MIN_REL = +opt("--min", 0.004); // piezas más pequeñas que esta fracción del modelo se descartan
const GRAY = has("--gray"); // ignora texturas (útil para quitar logotipos)
const INSPECT = has("--inspect");
const GROUPS = (opt("--groups", "") || "")
  .split(";")
  .filter(Boolean)
  .map((s) => {
    const [id, re] = s.split("=");
    return [id, new RegExp(re, "i")];
  });
GROUPS.push(["body", /./]);

await MeshoptSimplifier.ready;
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "meshopt.decoder": MeshoptDecoder,
});
const doc = await io.read(input);
const root = doc.getRoot();

const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const srgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

const texCache = new Map();
async function sampleTexture(t) {
  if (texCache.has(t)) return texCache.get(t);
  let v = null;
  try {
    const img = t.getImage();
    if (img) {
      const { data, info } = await sharp(Buffer.from(img))
        .resize(TEX, TEX, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      v = { data, w: info.width, h: info.height };
    }
  } catch {
    v = null;
  }
  texCache.set(t, v);
  return v;
}

// ── 1. Recolectar primitivas con sus matrices de mundo ──────────────────────
const nodes = [];
for (const scene of root.listScenes()) scene.traverse((n) => n.getMesh() && nodes.push(n));
if (INSPECT) {
  let tris = 0;
  const names = new Map();
  for (const n of nodes) {
    for (const p of n.getMesh().listPrimitives()) {
      const idx = p.getIndices();
      const c = idx ? idx.getCount() / 3 : (p.getAttribute("POSITION")?.getCount() ?? 0) / 3;
      tris += c;
      names.set(n.getName(), (names.get(n.getName()) ?? 0) + c);
    }
  }
  console.log({ nodes: nodes.length, tris: Math.round(tris), materials: root.listMaterials().length, textures: root.listTextures().length });
  console.log([...names.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `${Math.round(v)}\t${k}`).join("\n"));
  process.exit(0);
}

const bucket = Object.fromEntries(GROUPS.map(([g]) => [g, { pos: [], col: [], idx: [], n: 0 }]));
const prims = [];
const gmin = [1e9, 1e9, 1e9];
const gmax = [-1e9, -1e9, -1e9];
for (const n of nodes) {
  const W = n.getWorldMatrix();
  const g = GROUPS.find(([, re]) => re.test(n.getName()))[0];
  for (const p of n.getMesh().listPrimitives()) {
    if (p.getMode() !== 4) continue; // solo triángulos
    const P = p.getAttribute("POSITION");
    if (!P) continue;
    const nV = P.getCount();
    const UV = p.getAttribute("TEXCOORD_0");
    const VC = p.getAttribute("COLOR_0");
    const m = p.getMaterial();
    const bcf = m ? m.getBaseColorFactor() : [1, 1, 1, 1];
    const emf = m ? m.getEmissiveFactor() : [0, 0, 0];
    const t = m && !GRAY ? m.getBaseColorTexture() : null;
    const T = t ? await sampleTexture(t) : null;
    const pos = new Float32Array(nV * 3);
    const col = new Float32Array(nV * 3);
    const v = [0, 0, 0];
    const uv = [0, 0];
    const vc = [1, 1, 1, 1];
    const mn = [1e9, 1e9, 1e9];
    const mx = [-1e9, -1e9, -1e9];
    for (let i = 0; i < nV; i++) {
      P.getElement(i, v);
      const x = W[0] * v[0] + W[4] * v[1] + W[8] * v[2] + W[12];
      const y = W[1] * v[0] + W[5] * v[1] + W[9] * v[2] + W[13];
      const z = W[2] * v[0] + W[6] * v[1] + W[10] * v[2] + W[14];
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      [x, y, z].forEach((c, k) => {
        mn[k] = Math.min(mn[k], c);
        mx[k] = Math.max(mx[k], c);
      });
      let r = 1, gg = 1, b = 1;
      if (T && UV) {
        UV.getElement(i, uv);
        const u = ((uv[0] % 1) + 1) % 1;
        const vv = ((uv[1] % 1) + 1) % 1;
        const ix = Math.min(T.w - 1, (u * T.w) | 0);
        const iy = Math.min(T.h - 1, (vv * T.h) | 0);
        const o = (iy * T.w + ix) * 3;
        r = lin(T.data[o] / 255);
        gg = lin(T.data[o + 1] / 255);
        b = lin(T.data[o + 2] / 255);
      }
      if (VC) {
        VC.getElement(i, vc);
        r *= vc[0];
        gg *= vc[1];
        b *= vc[2];
      }
      col[i * 3] = Math.min(1, r * bcf[0] + emf[0] * 0.5);
      col[i * 3 + 1] = Math.min(1, gg * bcf[1] + emf[1] * 0.5);
      col[i * 3 + 2] = Math.min(1, b * bcf[2] + emf[2] * 0.5);
    }
    let I = p.getIndices() ? p.getIndices().getArray() : null;
    if (!I) {
      I = new Uint32Array(nV);
      for (let i = 0; i < nV; i++) I[i] = i;
    }
    for (let k = 0; k < 3; k++) {
      gmin[k] = Math.min(gmin[k], mn[k]);
      gmax[k] = Math.max(gmax[k], mx[k]);
    }
    prims.push({ g, pos, col, I, diag: Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) });
  }
}
const modelDiag = Math.hypot(gmax[0] - gmin[0], gmax[1] - gmin[1], gmax[2] - gmin[2]);
let dropped = 0;
for (const pr of prims) {
  if (pr.diag < modelDiag * MIN_REL) {
    dropped++;
    continue;
  }
  const B = bucket[pr.g];
  const remap = new Map();
  for (let i = 0; i < pr.I.length; i++) {
    const o = pr.I[i];
    let r = remap.get(o);
    if (r === undefined) {
      r = B.n++;
      remap.set(o, r);
      B.pos.push(pr.pos[o * 3], pr.pos[o * 3 + 1], pr.pos[o * 3 + 2]);
      B.col.push(pr.col[o * 3], pr.col[o * 3 + 1], pr.col[o * 3 + 2]);
    }
    B.idx.push(r);
  }
}

// ── 2. Soldar y simplificar cada grupo ──────────────────────────────────────
const totalTris = Object.values(bucket).reduce((a, b) => a + b.idx.length / 3, 0);
const WELD = 1 / (modelDiag * 0.00035); // rejilla de soldadura relativa al tamaño del modelo
for (const g in bucket) {
  const B = bucket[g];
  if (!B.n) continue;
  const key = new Map();
  const P = [];
  const C = [];
  const cnt = [];
  const map = new Uint32Array(B.n);
  for (let i = 0; i < B.n; i++) {
    const x = B.pos[i * 3], y = B.pos[i * 3 + 1], z = B.pos[i * 3 + 2];
    // El color entra en la clave (cuantizado) para no mezclar piezas de distinto color.
    const ck = ((B.col[i * 3] * 7) | 0) + "," + ((B.col[i * 3 + 1] * 7) | 0) + "," + ((B.col[i * 3 + 2] * 7) | 0);
    const k = Math.round(x * WELD) + "," + Math.round(y * WELD) + "," + Math.round(z * WELD) + "|" + ck;
    let r = key.get(k);
    if (r === undefined) {
      r = P.length / 3;
      key.set(k, r);
      P.push(x, y, z);
      C.push(0, 0, 0);
      cnt.push(0);
    }
    map[i] = r;
    C[r * 3] += B.col[i * 3];
    C[r * 3 + 1] += B.col[i * 3 + 1];
    C[r * 3 + 2] += B.col[i * 3 + 2];
    cnt[r]++;
  }
  for (let i = 0; i < cnt.length; i++) for (let k = 0; k < 3; k++) C[i * 3 + k] /= cnt[i];
  const I0 = [];
  for (let i = 0; i < B.idx.length; i += 3) {
    const a = map[B.idx[i]], b = map[B.idx[i + 1]], c = map[B.idx[i + 2]];
    if (a !== b && b !== c && a !== c) I0.push(a, b, c);
  }
  const posF = new Float32Array(P);
  const I = new Uint32Array(I0);
  const share = (B.idx.length / 3 / totalTris) * TRIS;
  const tgt = Math.min(I.length, Math.max(300, Math.round(share)) * 3);
  let out = I;
  if (I.length > tgt) {
    for (const e of [0.02, 0.05, 0.1, 0.25, 0.5, 1]) {
      out = MeshoptSimplifier.simplify(I, posF, 3, tgt, e, [])[0];
      if (out.length <= tgt * 1.15) break;
    }
    if (out.length > tgt * 1.6) {
      // Las mallas con muchas piezas sueltas no bajan con "simplify": se usa la variante descuidada.
      out = MeshoptSimplifier.simplifySloppy(I, posF, 3, tgt, 1)[0];
    }
  }
  const rm = new Map();
  const np = [], nc = [], ni = [];
  for (let i = 0; i < out.length; i++) {
    const o = out[i];
    let r = rm.get(o);
    if (r === undefined) {
      r = np.length / 3;
      rm.set(o, r);
      np.push(P[o * 3], P[o * 3 + 1], P[o * 3 + 2]);
      nc.push(C[o * 3], C[o * 3 + 1], C[o * 3 + 2]);
    }
    ni.push(r);
  }
  B.pos = np;
  B.col = nc;
  B.idx = ni;
  B.n = np.length / 3;
}

// ── 3. Cuantizar, codificar por diferencias y comprimir ─────────────────────
const mn = [1e9, 1e9, 1e9];
const mx = [-1e9, -1e9, -1e9];
for (const g in bucket) {
  const a = bucket[g].pos;
  for (let i = 0; i < a.length; i += 3)
    for (let k = 0; k < 3; k++) {
      mn[k] = Math.min(mn[k], a[i + k]);
      mx[k] = Math.max(mx[k], a[i + k]);
    }
}
const chunks = [];
const meta = { min: mn, max: mx, groups: [] };
let tv = 0, tt = 0;
const delta16 = (arr, stride) => {
  const o = new Uint16Array(arr.length);
  for (let i = 0; i < arr.length; i++) o[i] = (arr[i] - (i >= stride ? arr[i - stride] : 0)) & 0xffff;
  return o;
};
for (const [g] of GROUPS) {
  const B = bucket[g];
  const nV = B.n, nI = B.idx.length;
  if (!nV) continue;
  if (nV > 65535) throw new Error(`El grupo ${g} supera 65 535 vértices; baja --tris o divide en grupos`);
  tv += nV;
  tt += nI / 3;
  const q = new Uint16Array(nV * 3);
  for (let i = 0; i < nV * 3; i++) {
    const k = i % 3;
    q[i] = Math.round(((B.pos[i] - mn[k]) / (mx[k] - mn[k] || 1)) * 65535);
  }
  const c = new Uint8Array(nV * 3);
  for (let i = 0; i < nV * 3; i++) c[i] = Math.round(Math.min(1, srgb(Math.max(0, B.col[i]))) * 255);
  const ix = new Uint16Array(B.idx);
  const dix = new Uint16Array(nI);
  let hi = 0;
  for (let i = 0; i < nI; i++) {
    const v = ix[i];
    dix[i] = (hi - v) & 0xffff;
    if (v === hi) hi++;
  }
  const cd = new Uint8Array(c.length);
  for (let i = 0; i < c.length; i++) cd[i] = (c[i] - (i >= 3 ? c[i - 3] : 0)) & 255;
  chunks.push(Buffer.from(delta16(q, 3).buffer), Buffer.from(cd.buffer), Buffer.from(dix.buffer));
  const m0 = [1e9, 1e9, 1e9], m1 = [-1e9, -1e9, -1e9];
  for (let i = 0; i < nV * 3; i += 3)
    for (let k = 0; k < 3; k++) {
      m0[k] = Math.min(m0[k], B.pos[i + k]);
      m1[k] = Math.max(m1[k], B.pos[i + k]);
    }
  meta.groups.push({
    id: g,
    v: nV,
    i: nI,
    c: m0.map((a, k) => +((a + m1[k]) / 2).toFixed(4)),
    s: m0.map((a, k) => +(m1[k] - a).toFixed(4)),
  });
}
const raw = Buffer.concat(chunks);
const gz = zlib.gzipSync(raw, { level: 9 });
const outDir = path.resolve("public/models");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${name}.bin.gz`), gz);
fs.writeFileSync(path.join(outDir, `${name}.meta.json`), JSON.stringify(meta));
console.log(
  `${name}: ${Math.round(totalTris)} → ${tt} triángulos · ${tv} vértices · ${(fs.statSync(input).size / 1e6).toFixed(1)} MB → ${(gz.length / 1024).toFixed(0)} KB · descartadas ${dropped} piezas`,
);
