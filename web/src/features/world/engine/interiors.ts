/**
 * Interiores de cabina generados por código (los modelos interiores de NASA
 * pesan cientos de MB). Cada ambiente tiene su geometría, su "arriba" y su
 * ventilación: de ahí salen la forma de la llama y el camino del humo.
 */
import * as THREE from "three";
import type { ModuleId } from "@/content/modules";
import type { InteriorSpec } from "./flame";

export interface Interior {
  scene: THREE.Scene;
  spec: InteriorSpec;
  fog: THREE.FogExp2;
}

type Ctx = CanvasRenderingContext2D;

function tex(w: number, h: number, draw: (x: Ctx) => void, repeat?: [number, number]): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

/** Rack de equipos: cajones, rejillas, pantallas e interruptores. */
function rackTex(seed: number, tone = "#d9dcd6"): THREE.CanvasTexture {
  let s = seed * 9301 + 49297;
  const r = (): number => ((s = (s * 9301 + 49297) % 233280), s / 233280);
  return tex(256, 384, (x) => {
    x.fillStyle = tone;
    x.fillRect(0, 0, 256, 384);
    x.strokeStyle = "#8f9591";
    x.lineWidth = 6;
    x.strokeRect(3, 3, 250, 378);
    let y = 12;
    while (y < 360) {
      const h = 40 + Math.floor(r() * 4) * 22;
      const kind = r();
      x.fillStyle = kind < 0.25 ? "#2a3136" : kind < 0.5 ? "#c9cdc8" : "#e6e8e2";
      x.fillRect(12, y, 232, Math.min(h, 368 - y));
      x.strokeStyle = "rgba(60,66,70,.55)";
      x.lineWidth = 2;
      x.strokeRect(12, y, 232, Math.min(h, 368 - y));
      if (kind < 0.25) {
        // pantalla
        x.fillStyle = "#0c2a3c";
        x.fillRect(22, y + 8, 120, h - 16);
        x.strokeStyle = "#35d8f2";
        x.lineWidth = 1.5;
        x.beginPath();
        for (let i = 0; i < 12; i++) x.lineTo(26 + i * 10, y + h / 2 + Math.sin(i * 1.3 + seed) * (h / 5));
        x.stroke();
        for (let i = 0; i < 4; i++) {
          x.fillStyle = r() > 0.5 ? "#00d49a" : "#ff8738";
          x.fillRect(156 + i * 20, y + 12, 10, 6);
        }
      } else if (kind < 0.5) {
        // rejilla de ventilación
        x.strokeStyle = "#7d8480";
        for (let i = 0; i < Math.floor(h / 7) - 1; i++) {
          x.beginPath();
          x.moveTo(24, y + 8 + i * 7);
          x.lineTo(232, y + 8 + i * 7);
          x.stroke();
        }
      } else {
        // cajón con asa y etiqueta
        x.fillStyle = "#7f8682";
        x.fillRect(98, y + h / 2 - 4, 60, 8);
        x.fillStyle = r() > 0.5 ? "#2c6dd3" : "#e6b93a";
        x.fillRect(20, y + 8, 44, 10);
        x.fillStyle = "rgba(40,44,48,.7)";
        x.fillRect(180, y + 8, 50, 4);
        x.fillRect(180, y + 16, 34, 4);
      }
      y += h + 6;
    }
  });
}

/** Acolchado térmico de cápsula. */
const quiltTex = (rep: [number, number]): THREE.CanvasTexture =>
  tex(
    128,
    128,
    (x) => {
      x.fillStyle = "#cfd3cf";
      x.fillRect(0, 0, 128, 128);
      x.strokeStyle = "rgba(90,98,104,.5)";
      x.lineWidth = 2;
      for (let i = 0; i <= 2; i++) {
        x.beginPath();
        x.moveTo(i * 64, 0);
        x.lineTo(i * 64, 128);
        x.moveTo(0, i * 64);
        x.lineTo(128, i * 64);
        x.stroke();
      }
      x.fillStyle = "rgba(60,66,72,.6)";
      for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) x.fillRect(i * 64 - 3, j * 64 - 3, 6, 6);
    },
    rep,
  );

const floorTex = (rep: [number, number]): THREE.CanvasTexture =>
  tex(
    128,
    128,
    (x) => {
      x.fillStyle = "#4b5258";
      x.fillRect(0, 0, 128, 128);
      x.strokeStyle = "#353b40";
      x.lineWidth = 3;
      x.strokeRect(2, 2, 124, 124);
      x.fillStyle = "#5a6268";
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) x.fillRect(14 + i * 28, 14 + j * 28, 16, 3);
    },
    rep,
  );

/** Ventana con el exterior: espacio profundo o superficie lunar. */
const windowTex = (kind: "space" | "moon"): THREE.CanvasTexture =>
  tex(256, 160, (x) => {
    x.fillStyle = "#02060d";
    x.fillRect(0, 0, 256, 160);
    for (let i = 0; i < 70; i++) {
      x.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
      x.fillRect(Math.random() * 256, Math.random() * (kind === "moon" ? 90 : 160), 1.4, 1.4);
    }
    if (kind === "moon") {
      const g = x.createLinearGradient(0, 86, 0, 160);
      g.addColorStop(0, "#b9b9b4");
      g.addColorStop(1, "#56565a");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(0, 100);
      x.bezierCurveTo(60, 84, 120, 104, 180, 90);
      x.bezierCurveTo(210, 84, 240, 96, 256, 92);
      x.lineTo(256, 160);
      x.lineTo(0, 160);
      x.fill();
      x.fillStyle = "rgba(40,40,44,.45)";
      for (let i = 0; i < 9; i++) {
        x.beginPath();
        x.ellipse(Math.random() * 256, 112 + Math.random() * 44, 6 + Math.random() * 16, 2 + Math.random() * 4, 0, 0, 6.3);
        x.fill();
      }
    } else {
      const g = x.createRadialGradient(200, 150, 10, 200, 150, 120);
      g.addColorStop(0, "#3d8fe0");
      g.addColorStop(0.6, "#12305e");
      g.addColorStop(1, "rgba(2,6,13,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 256, 160);
    }
  });

const screenTex = (seed: number): THREE.CanvasTexture =>
  tex(256, 160, (x) => {
    x.fillStyle = "#061a2a";
    x.fillRect(0, 0, 256, 160);
    x.strokeStyle = "rgba(53,216,242,.25)";
    for (let i = 1; i < 8; i++) {
      x.beginPath();
      x.moveTo(i * 32, 0);
      x.lineTo(i * 32, 160);
      x.moveTo(0, i * 20);
      x.lineTo(256, i * 20);
      x.stroke();
    }
    x.strokeStyle = "#35d8f2";
    x.lineWidth = 2;
    x.beginPath();
    for (let i = 0; i <= 32; i++) x.lineTo(i * 8, 90 + Math.sin(i * 0.5 + seed) * 24 + Math.sin(i * 1.7 + seed * 2) * 9);
    x.stroke();
    x.fillStyle = "#00d49a";
    x.fillRect(14, 14, 70, 8);
    x.fillStyle = "#ff8738";
    x.fillRect(14, 28, 44, 8);
  });

const std = (color: number, roughness = 0.75, metalness = 0.08): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function box(scene: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, ry = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  scene.add(m);
  return m;
}

function plane(scene: THREE.Object3D, w: number, h: number, mat: THREE.Material, pos: [number, number, number], rot: [number, number, number]): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  scene.add(m);
  return m;
}

function baseScene(bg: number, fogColor: number, hemi: [number, number, number]): { scene: THREE.Scene; fog: THREE.FogExp2 } {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  const fog = new THREE.FogExp2(fogColor, 0.02);
  scene.fog = fog;
  scene.add(new THREE.HemisphereLight(hemi[0], hemi[1], hemi[2]));
  const sun = new THREE.DirectionalLight(0xfff4e6, 0.55);
  sun.position.set(-1, 2, 1.5);
  scene.add(sun);
  return { scene, fog };
}

const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

/** Laboratorio de la estación (tipo Destiny): pasillo de racks en las cuatro paredes. */
function buildStation(): Interior {
  const { scene, fog } = baseScene(0x0c0f12, 0x70757a, [0xeef4ff, 0x7f8488, 0.78]);
  const W = 1.05, LEN = 4.2;
  const geo = new THREE.PlaneGeometry(1.14, 1.74);
  const walls: [number, number, number, number, number][] = [
    [0, W - 0.001, 0, Math.PI, 0],
    [0, -W + 0.001, 0, 0, 0],
    [W - 0.001, 0, Math.PI / 2, 0, 0],
    [-W + 0.001, 0, -Math.PI / 2, 0, 0],
  ];
  const mats = [1, 2, 3, 4].map((i) => new THREE.MeshStandardMaterial({ map: rackTex(i), roughness: 0.72, metalness: 0.05 }));
  const inst = mats.map((m) => new THREE.InstancedMesh(geo, m, 28));
  const cnt = [0, 0, 0, 0];
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1);
  walls.forEach(([y, z, rx, ry], wi) => {
    for (let b = 0; b < 7; b++) {
      P.set(-LEN + 0.6 + b * 1.2, y, z);
      E.set(rx, ry, 0);
      Q.setFromEuler(E);
      M.compose(P, Q, S);
      const v = (b + wi * 2) % 4;
      inst[v]!.setMatrixAt(cnt[v]!++, M);
    }
  });
  inst.forEach((m, i) => {
    m.count = cnt[i]!;
    scene.add(m);
  });
  const so = std(0xb9bfbd, 0.8);
  for (const [y, z] of [[W, W], [W, -W], [-W, W], [-W, -W]] as const) {
    const m = box(scene, LEN * 2, 0.42, 0.42, so, 0, y * 0.98, z * 0.98);
    m.rotation.x = Math.PI / 4;
  }
  const lm = new THREE.MeshBasicMaterial({ color: 0xf8f6ec });
  for (const x of [-2.7, -0.9, 0.9, 2.7])
    for (const s of [1, -1]) {
      const l = box(scene, 0.72, 0.015, 0.15, lm, x, W * 0.78, s * W * 0.78);
      l.rotation.x = (s * Math.PI) / 4;
    }
  const rail = new THREE.CylinderGeometry(0.011, 0.011, 0.42, 6);
  rail.rotateZ(Math.PI / 2);
  const cols = [0x2c6dd3, 0xe6b93a, 0xdcdcd4];
  for (let i = 0; i < 7; i++)
    for (const [y, z] of [[0.78, 0.86], [0.78, -0.86], [-0.78, 0.86], [-0.78, -0.86]] as const) {
      const m = new THREE.Mesh(rail, std(cols[(i + (z > 0 ? 1 : 0)) % 3]!, 0.45));
      m.position.set(-3.6 + i * 1.2, y, z);
      scene.add(m);
    }
  const hatch = tex(256, 256, (x) => {
    x.fillStyle = "#c4c9c6";
    x.fillRect(0, 0, 256, 256);
    const g = x.createRadialGradient(128, 128, 14, 128, 128, 96);
    g.addColorStop(0, "#fff2d6");
    g.addColorStop(0.7, "#5e6f76");
    g.addColorStop(1, "#1d262c");
    x.fillStyle = g;
    x.beginPath();
    x.arc(128, 128, 92, 0, 6.3);
    x.fill();
    x.lineWidth = 13;
    x.strokeStyle = "#8d9391";
    x.beginPath();
    x.arc(128, 128, 98, 0, 6.3);
    x.stroke();
  });
  for (const s of [1, -1]) plane(scene, 2.1, 2.1, new THREE.MeshBasicMaterial({ map: hatch }), [s * LEN, 0, 0], [0, (-s * Math.PI) / 2, 0]);
  const bagM = std(0xe7e3d4, 0.95);
  for (let i = 0; i < 7; i++) {
    let x = -3.3 + i * 1.05;
    if (Math.abs(x) < 1.5) x += x < 0 ? -1.4 : 1.4;
    const b = box(scene, 0.5, 0.27, 0.36, bagM, x, (i % 3 === 0 ? -1 : 1) * 0.66, (i % 2 ? 1 : 0.74) * 0.8);
    b.rotation.set(i * 0.11, i * 0.2, i * 0.07);
  }
  const spec: InteriorSpec = {
    center: V(0, 0, 0),
    half: V(LEN - 0.1, W - 0.05, W - 0.05),
    up: V(0, 1, 0),
    ventDir: V(1, 0, 0),
    sample: V(0, 0.03, -(W - 0.04)),
    axis: V(1, 0, 0),
    normal: V(0, 0, 1),
    camera: V(-0.85, 0.12, 0.42),
    minDist: 0.5,
    maxDist: 2.9,
    fog: 0x70757a,
  };
  return { scene, spec, fog };
}

/** Cabina de nave: cápsula cónica con asientos, consola y ventanillas. */
function buildSpacecraft(): Interior {
  const { scene, fog } = baseScene(0x0a0d11, 0x6c7279, [0xf2f6ff, 0x6c7076, 0.72]);
  const profile = [V(1.95, -1.15, 0), V(1.9, -0.5, 0), V(1.55, 0.6, 0), V(1.1, 1.35, 0), V(0.62, 1.6, 0)].map((p) => new THREE.Vector2(p.x, p.y));
  const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), new THREE.MeshStandardMaterial({ map: quiltTex([18, 5]), roughness: 0.9, side: THREE.BackSide }));
  scene.add(shell);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.95, 40), new THREE.MeshStandardMaterial({ map: floorTex([7, 7]), roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.15;
  scene.add(floor);
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.62, 28), new THREE.MeshBasicMaterial({ color: 0x1c242b }));
  top.rotation.x = Math.PI / 2;
  top.position.y = 1.6;
  scene.add(top);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 40), new THREE.MeshBasicMaterial({ color: 0xfff4dc }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.56;
  scene.add(ring);
  // Consola principal con tres pantallas
  const consoleM = std(0x2a3036, 0.6, 0.3);
  const cons = box(scene, 1.9, 0.75, 0.16, consoleM, 0, -0.1, -1.42);
  cons.rotation.x = -0.18;
  for (let i = -1; i <= 1; i++) {
    const s = plane(scene, 0.54, 0.36, new THREE.MeshBasicMaterial({ map: screenTex(i + 3) }), [i * 0.6, 0.02, -1.325], [-0.18, 0, 0]);
    s.renderOrder = 0;
  }
  // Asientos
  const seatM = std(0x39424b, 0.9);
  for (const [x, z] of [[-0.55, 0.55], [0.55, 0.55], [-0.55, 1.25], [0.55, 1.25]] as const) {
    box(scene, 0.5, 0.1, 0.9, seatM, x, -0.82, z);
    box(scene, 0.5, 0.75, 0.1, seatM, x, -0.45, z + 0.42).rotation.x = 0.25;
    box(scene, 0.34, 0.14, 0.22, std(0x59636d, 0.9), x, -0.02, z + 0.5);
  }
  // Ventanillas
  const win = new THREE.MeshBasicMaterial({ map: windowTex("space") });
  for (const s of [-1, 1]) {
    const w = plane(scene, 0.5, 0.32, win, [s * 1.36, 0.55, -0.55], [0, -s * 1.15, 0]);
    w.rotation.z = s * 0.05;
    const frame = box(scene, 0.58, 0.4, 0.03, std(0x8d9391, 0.5, 0.6), s * 1.385, 0.55, -0.56, -s * 1.15);
    frame.renderOrder = -1;
  }
  // Taquillas de estiba
  const lockerM = new THREE.MeshStandardMaterial({ map: rackTex(7, "#d2d5cf"), roughness: 0.75 });
  for (const s of [-1, 1]) plane(scene, 0.9, 1.1, lockerM, [s * 1.62, -0.45, 0.6], [0, -s * Math.PI / 2, 0]);
  // Soporte de la muestra
  box(scene, 0.04, 0.5, 0.04, std(0x8d9391, 0.4, 0.7), -0.6, 0.32, -0.98);
  box(scene, 0.04, 0.5, 0.04, std(0x8d9391, 0.4, 0.7), 0.6, 0.32, -0.98);
  const spec: InteriorSpec = {
    center: V(0, 0.1, 0),
    half: V(1.25, 1.15, 1.3),
    up: V(0, 1, 0),
    ventDir: V(1, 0, 0),
    sample: V(0, 0.52, -0.94),
    axis: V(1, 0, 0),
    normal: V(0, 0, 1),
    camera: V(-0.75, 0.62, 0.55),
    minDist: 0.5,
    maxDist: 2.2,
    fog: 0x6c7279,
  };
  return { scene, spec, fog };
}

/** Cabina del rover presurizado: puesto de conducción con ventanales a la superficie lunar. */
function buildRover(): Interior {
  const { scene, fog } = baseScene(0x0b0d10, 0x74787c, [0xf4f6fb, 0x77736c, 0.74]);
  const HX = 2.2, HY = 1.0, HZ = 1.15;
  const wallM = new THREE.MeshStandardMaterial({ map: rackTex(11, "#dcdfd9"), roughness: 0.78 });
  const wallM2 = new THREE.MeshStandardMaterial({ map: rackTex(12, "#d5d8d2"), roughness: 0.78 });
  for (let i = 0; i < 4; i++) {
    plane(scene, 1.1, 2 * HY, i % 2 ? wallM : wallM2, [-HX + 0.55 + i * 1.1, 0, -HZ], [0, 0, 0]);
    plane(scene, 1.1, 2 * HY, i % 2 ? wallM2 : wallM, [-HX + 0.55 + i * 1.1, 0, HZ], [0, Math.PI, 0]);
  }
  plane(scene, 2 * HX, 2 * HZ, new THREE.MeshStandardMaterial({ map: floorTex([9, 5]), roughness: 0.85 }), [0, -HY, 0], [-Math.PI / 2, 0, 0]);
  plane(scene, 2 * HX, 2 * HZ, new THREE.MeshStandardMaterial({ map: quiltTex([8, 4]), roughness: 0.9 }), [0, HY, 0], [Math.PI / 2, 0, 0]);
  const lm = new THREE.MeshBasicMaterial({ color: 0xfbf6e6 });
  for (const x of [-1.2, 0.2]) box(scene, 0.9, 0.02, 0.16, lm, x, HY - 0.012, 0);
  // Frente: ventanales con la superficie lunar
  const winM = new THREE.MeshBasicMaterial({ map: windowTex("moon") });
  plane(scene, 2 * HZ - 0.2, 1.05, winM, [HX, 0.3, 0], [0, -Math.PI / 2, 0]);
  const pillarM = std(0xe0e2de, 0.7);
  for (const z of [-0.36, 0.36]) box(scene, 0.06, 1.1, 0.07, pillarM, HX - 0.03, 0.3, z);
  box(scene, 0.1, 0.42, 2 * HZ, std(0x2b3238, 0.6, 0.3), HX - 0.1, -0.5, 0);
  for (const z of [-0.5, 0.5]) {
    plane(scene, 0.46, 0.26, new THREE.MeshBasicMaterial({ map: screenTex(z * 4 + 5) }), [HX - 0.16, -0.42, z], [0, -Math.PI / 2, 0]);
    box(scene, 0.5, 0.1, 0.46, std(0x39424b, 0.9), HX - 0.9, -0.55, z);
    box(scene, 0.1, 0.7, 0.46, std(0x39424b, 0.9), HX - 1.16, -0.2, z);
  }
  // Fondo: puertos de traje
  plane(scene, 2 * HZ, 2 * HY, new THREE.MeshStandardMaterial({ color: 0xd4d7d1, roughness: 0.8 }), [-HX, 0, 0], [0, Math.PI / 2, 0]);
  for (const z of [-0.5, 0.5]) {
    const port = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 30), std(0x8d9391, 0.4, 0.7));
    port.position.set(-HX + 0.03, 0, z);
    port.rotation.y = Math.PI / 2;
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.33, 28), std(0x3b444c, 0.6, 0.2));
    cap.position.set(-HX + 0.02, 0, z);
    cap.rotation.y = Math.PI / 2;
    scene.add(port, cap);
  }
  // Banco de trabajo bajo la muestra
  box(scene, 1.3, 0.05, 0.4, std(0x9aa0a4, 0.5, 0.5), -0.3, -0.56, -HZ + 0.21);
  const spec: InteriorSpec = {
    center: V(0, 0, 0),
    half: V(HX - 0.05, HY - 0.05, HZ - 0.05),
    up: V(0, 1, 0),
    ventDir: V(1, 0, 0),
    sample: V(-0.3, 0.02, -(HZ - 0.04)),
    axis: V(0, 1, 0),
    normal: V(0, 0, 1),
    camera: V(-1.05, 0.1, 0.5),
    minDist: 0.5,
    maxDist: 2.1,
    fog: 0x74787c,
  };
  return { scene, spec, fog };
}

/** Hábitat de la base: módulo cilíndrico con estaciones de trabajo alrededor. */
function buildBase(): Interior {
  const { scene, fog } = baseScene(0x0c0e11, 0x777a7d, [0xf6f4ee, 0x7a766e, 0.76]);
  const R = 3.0, Y0 = -1.25, Y1 = 1.45;
  const wallT = rackTex(21, "#dedfd8");
  wallT.wrapS = THREE.RepeatWrapping;
  wallT.repeat.set(14, 1);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Y1 - Y0, 56, 1, true), new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.78, side: THREE.BackSide }));
  wall.position.y = (Y0 + Y1) / 2;
  scene.add(wall);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R, 56), new THREE.MeshStandardMaterial({ map: floorTex([11, 11]), roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = Y0;
  scene.add(floor);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.35, 48, 16, 0, Math.PI * 2, 0, 0.84), new THREE.MeshStandardMaterial({ map: quiltTex([20, 5]), roughness: 0.92, side: THREE.BackSide }));
  dome.position.y = Y1 - R * 1.35 * Math.cos(0.84);
  scene.add(dome);
  const ringL = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }));
  ringL.rotation.x = Math.PI / 2;
  ringL.position.y = Y1 + 0.42;
  scene.add(ringL);
  // Columna central y mesa
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, Y1 - Y0 + 0.8, 16), std(0xb9bfbd, 0.6, 0.4));
  col.position.set(1.1, (Y0 + Y1) / 2 + 0.2, 0.8);
  scene.add(col);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.05, 28), std(0xe8e6de, 0.6));
  table.position.set(1.1, -0.45, 0.8);
  scene.add(table);
  // Mesa de laboratorio bajo la muestra
  box(scene, 1.7, 0.06, 0.5, std(0x9aa0a4, 0.5, 0.5), 0, -0.58, -R + 0.38);
  box(scene, 1.7, 0.66, 0.44, new THREE.MeshStandardMaterial({ map: rackTex(5, "#d0d3cd"), roughness: 0.8 }), 0, -0.93, -R + 0.38);
  // Cultivo hidropónico
  const plantM = new THREE.MeshStandardMaterial({ color: 0x3fae5e, roughness: 0.9, emissive: 0x0d3a1c, emissiveIntensity: 0.6 });
  for (let i = 0; i < 3; i++) {
    box(scene, 0.9, 0.04, 0.3, std(0xe8e6de, 0.6), -2.25, -0.55 + i * 0.45, -1.35, 1.03);
    for (let j = 0; j < 5; j++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.07 + (j % 2) * 0.02, 8, 6), plantM);
      p.position.set(-2.25 + Math.cos(1.03) * (j - 2) * 0.17, -0.46 + i * 0.45, -1.35 - Math.sin(1.03) * (j - 2) * 0.17);
      scene.add(p);
    }
  }
  const grow = new THREE.PointLight(0xff7ad9, 1.4, 2.2, 1.6);
  grow.position.set(-2.0, 0.3, -1.2);
  scene.add(grow);
  // Ventanilla a la superficie
  const winM = new THREE.MeshBasicMaterial({ map: windowTex("moon") });
  const w = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), winM);
  w.position.set(2.45, 0.35, -1.68);
  w.rotation.y = -0.97;
  const wf = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.045, 10, 32), std(0x8d9391, 0.4, 0.7));
  wf.position.copy(w.position);
  wf.rotation.copy(w.rotation);
  scene.add(w, wf);
  const spec: InteriorSpec = {
    center: V(0, 0.1, -0.9),
    half: V(1.9, 1.3, 1.9),
    up: V(0, 1, 0),
    ventDir: V(1, 0, 0),
    sample: V(0, 0.12, -(R - 0.07)),
    axis: V(0, 1, 0),
    normal: V(0, 0, 1),
    camera: V(-0.95, 0.2, -1.35),
    minDist: 0.5,
    maxDist: 2.6,
    fog: 0x777a7d,
  };
  return { scene, spec, fog };
}

const BUILDERS: Record<ModuleId, () => Interior> = {
  nave: buildSpacecraft,
  estacion: buildStation,
  rover: buildRover,
  base: buildBase,
};

/** Construye (una sola vez por módulo) el interior de la cabina. */
export const buildInterior = (id: ModuleId): Interior => BUILDERS[id]();
