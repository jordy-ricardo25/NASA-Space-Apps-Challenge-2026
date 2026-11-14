/**
 * Cargador de los modelos optimizados por `scripts/bake-model.mjs`.
 * Hace el proceso inverso del "bake": descomprime (gzip), deshace las
 * diferencias y reconstruye la geometría con color por vértice.
 */
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export interface ModelGroupMeta {
  id: string;
  v: number;
  i: number;
  c: number[];
  s: number[];
}

export interface ModelMeta {
  min: number[];
  max: number[];
  groups: ModelGroupMeta[];
}

export interface LoadedModel {
  meta: ModelMeta;
  /** Una geometría por grupo, centrada en XZ y apoyada en y = 0. */
  geometries: Map<string, THREE.BufferGeometry>;
  /** Tamaño de la caja envolvente (unidades del modelo). */
  size: THREE.Vector3;
  /** Centro de cada grupo en el sistema ya centrado. */
  centers: Map<string, THREE.Vector3>;
}

async function gunzip(buf: ArrayBuffer): Promise<ArrayBuffer> {
  const head = new Uint8Array(buf, 0, 2);
  // Si el servidor ya descomprimió el archivo, se usa tal cual.
  if (head[0] !== 0x1f || head[1] !== 0x8b) return buf;
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).arrayBuffer();
}

/**
 * Descarga y decodifica un modelo de `public/models`.
 * @param name     nombre base del archivo (sin extensión)
 * @param smooth   true: normales suaves con aristas marcadas; false: sombreado plano
 * @param baseY    "min" apoya el modelo en el suelo; "center" lo centra en altura
 */
export async function loadModel(name: string, smooth = true, baseY: "min" | "center" = "min"): Promise<LoadedModel> {
  const [metaRes, binRes] = await Promise.all([fetch(`/models/${name}.meta.json`), fetch(`/models/${name}.bin.gz`)]);
  if (!metaRes.ok || !binRes.ok) throw new Error(`No se pudo cargar el modelo ${name}`);
  const meta = (await metaRes.json()) as ModelMeta;
  const buf = await gunzip(await binRes.arrayBuffer());
  const mn = meta.min as [number, number, number];
  const mx = meta.max as [number, number, number];
  const origin: [number, number, number] = [
    (mn[0] + mx[0]) / 2,
    baseY === "min" ? mn[1] : (mn[1] + mx[1]) / 2,
    (mn[2] + mx[2]) / 2,
  ];
  const geometries = new Map<string, THREE.BufferGeometry>();
  const centers = new Map<string, THREE.Vector3>();
  let o = 0;
  for (const g of meta.groups) {
    const q = new Uint16Array(buf.slice(o, o + g.v * 6));
    o += g.v * 6;
    const c = new Uint8Array(buf.slice(o, o + g.v * 3));
    o += g.v * 3;
    const d = new Uint16Array(buf.slice(o, o + g.i * 2));
    o += g.i * 2;
    for (let i = 3; i < q.length; i++) q[i] = (q[i]! + q[i - 3]!) & 0xffff;
    for (let i = 3; i < c.length; i++) c[i] = (c[i]! + c[i - 3]!) & 255;
    const idx = new Uint16Array(g.i);
    let hi = 0;
    for (let i = 0; i < g.i; i++) {
      const v = (hi - d[i]!) & 0xffff;
      idx[i] = v;
      if (v === hi) hi++;
    }
    const pos = new Float32Array(g.v * 3);
    for (let i = 0; i < pos.length; i++) {
      const k = i % 3;
      pos[i] = mn[k]! + (q[i]! / 65535) * (mx[k]! - mn[k]!) - origin[k]!;
    }
    let geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(c, 3, true));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    if (smooth) geo = toCreasedNormals(geo, Math.PI / 4.5);
    geo.computeBoundingSphere();
    geometries.set(g.id, geo);
    centers.set(g.id, new THREE.Vector3(g.c[0]! - origin[0], g.c[1]! - origin[1], g.c[2]! - origin[2]));
  }
  return {
    meta,
    geometries,
    centers,
    size: new THREE.Vector3(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]),
  };
}

/** Crea una malla con color por vértice a partir de un grupo del modelo. */
export function modelMesh(
  model: LoadedModel,
  group = "body",
  opts: { flat?: boolean; roughness?: number; metalness?: number; tint?: number } = {},
): THREE.Mesh {
  const geo = model.geometries.get(group);
  if (!geo) throw new Error(`Grupo ${group} inexistente`);
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: opts.flat ?? false,
    side: THREE.DoubleSide,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.12,
    color: opts.tint ?? 0xffffff,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
