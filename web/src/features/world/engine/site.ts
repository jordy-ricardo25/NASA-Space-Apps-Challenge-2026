/**
 * Sitio lunar del centro de mando: coloca los modelos abiertos de NASA
 * (ISS, Space Exploration Vehicle, Habitat Demonstration Unit, Saturn V,
 * Mobile Launcher, Astronaut) sobre el terreno y añade utilería generada por
 * código (plataformas, paneles solares, antena, balizas).
 */
import * as THREE from "three";
import type { ModuleId } from "@/content/modules";
import { loadModel, modelMesh, type LoadedModel } from "./modelLoader";
import { SUN_DIR } from "./sky";

export interface FocusView {
  /** Punto que mira la cámara y posición inicial relativa a ese punto. */
  target: THREE.Vector3;
  offset: THREE.Vector3;
  minDist: number;
  maxDist: number;
  /** true: la cámara no puede bajar del horizonte (módulos de superficie). */
  ground: boolean;
  /** Ángulo polar mínimo (rad): impide subir la cámara por encima del objetivo. */
  minPolar?: number;
}

export interface SiteModule {
  id: ModuleId;
  group: THREE.Group;
  /** Posición (mundo) de la etiqueta flotante. */
  anchor: THREE.Vector3;
  /** Esfera aproximada para seleccionar el módulo con el cursor. */
  pick: THREE.Sphere;
  focus: FocusView;
  materials: THREE.MeshStandardMaterial[];
}

export interface Site {
  root: THREE.Group;
  modules: Record<ModuleId, SiteModule>;
  /** Animaciones propias del sitio (órbita de la estación, balizas, antena). */
  update: (t: number) => void;
}

const std = (color: number, roughness = 0.8, metalness = 0.1): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function shadowed<T extends THREE.Object3D>(o: T): T {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return o;
}

function solarTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const x = c.getContext("2d")!;
  x.fillStyle = "#0d1c3c";
  x.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 8; j++) {
      x.fillStyle = (i + j) % 2 ? "#16306a" : "#1b3a7c";
      x.fillRect(i * 16 + 1, j * 16 + 1, 14, 14);
    }
  x.strokeStyle = "#9fb4d6";
  x.lineWidth = 2;
  x.strokeRect(1, 1, 254, 126);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function padTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d")!;
  x.fillStyle = "#3a3d42";
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) {
    x.fillStyle = `rgba(${20 + Math.random() * 50},${20 + Math.random() * 50},${24 + Math.random() * 50},0.35)`;
    x.fillRect(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 10, 2 + Math.random() * 6);
  }
  x.strokeStyle = "#d9c64a";
  x.lineWidth = 14;
  x.setLineDash([36, 26]);
  x.beginPath();
  x.arc(256, 256, 222, 0, Math.PI * 2);
  x.stroke();
  x.setLineDash([]);
  x.strokeStyle = "rgba(230,240,250,0.8)";
  x.lineWidth = 6;
  x.beginPath();
  x.arc(256, 256, 120, 0, Math.PI * 2);
  x.moveTo(256, 96);
  x.lineTo(256, 416);
  x.moveTo(96, 256);
  x.lineTo(416, 256);
  x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Estación: un mesh por módulo de la ISS, con el patrón dorado de los paneles solares de la Alpha. */
function buildStation(iss: LoadedModel): { group: THREE.Group; materials: THREE.MeshStandardMaterial[] } {
  const group = new THREE.Group();
  const materials: THREE.MeshStandardMaterial[] = [];
  for (const g of iss.meta.groups) {
    const mesh = modelMesh(iss, g.id, { flat: true, roughness: 0.68, metalness: 0.2 });
    mesh.receiveShadow = false;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (g.id === "arrays") {
      mat.onBeforeCompile = (s) => {
        s.vertexShader = "varying vec3 vW;\n" + s.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvW=position;");
        s.fragmentShader =
          "varying vec3 vW;\n" +
          s.fragmentShader.replace(
            "#include <color_fragment>",
            "#include <color_fragment>\nfloat gx=smoothstep(.45,.5,abs(fract(vW.x*16.)-.5)),gz=smoothstep(.42,.5,abs(fract(vW.z*44.)-.5));diffuseColor.rgb*=vec3(.74,.53,.24)*(1.-.45*max(gx,gz));",
          );
      };
    }
    materials.push(mat);
    group.add(mesh);
  }
  return { group, materials };
}

export async function buildSite(heightAt: (x: number, z: number) => number, onProgress: (done: number, total: number, name: string) => void): Promise<Site> {
  const names = ["iss", "rover", "habitat-a", "habitat-b", "rocket", "tower", "astronaut"] as const;
  const models = {} as Record<(typeof names)[number], LoadedModel>;
  let done = 0;
  await Promise.all(
    names.map(async (n) => {
      models[n] = await loadModel(n, n !== "iss", n === "iss" ? "center" : "min");
      onProgress(++done, names.length, n);
    }),
  );

  const root = new THREE.Group();
  const mats = (o: THREE.Object3D): THREE.MeshStandardMaterial[] => {
    const out: THREE.MeshStandardMaterial[] = [];
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && "emissive" in m) out.push(m);
    });
    return out;
  };

  // ── Base lunar: tres unidades de hábitat (HDU) unidas por túneles ──────────
  const base = new THREE.Group();
  const HS = 0.034;
  const habTint = 0xe6e1d4;
  const habSpots: [number, number, number, "habitat-a" | "habitat-b"][] = [
    [4, -4, 0.25, "habitat-a"],
    [21, -11, -2.2, "habitat-b"],
    [-11, -13, 2.6, "habitat-a"],
  ];
  for (const [x, z, rot, name] of habSpots) {
    const mesh = modelMesh(models[name], "body", { roughness: 0.92, metalness: 0.02, tint: habTint });
    mesh.scale.setScalar(HS);
    mesh.rotation.y = rot;
    mesh.position.set(x, heightAt(x, z) - 0.25, z);
    base.add(mesh);
  }
  const tunnelMat = std(0xcfc9ba, 0.9, 0.05);
  const tunnel = (ax: number, az: number, bx: number, bz: number): void => {
    const a = new THREE.Vector3(ax, heightAt(ax, az) + 1.4, az);
    const b = new THREE.Vector3(bx, heightAt(bx, bz) + 1.4, bz);
    const len = a.distanceTo(b);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, len, 14), tunnelMat);
    t.position.copy(a).lerp(b, 0.5);
    t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    base.add(t);
    for (let i = 1; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 18), std(0x8a8f96, 0.5, 0.6));
      ring.position.copy(a).lerp(b, i / 4);
      ring.quaternion.copy(t.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
      base.add(ring);
    }
  };
  tunnel(8, -6, 15, -9);
  tunnel(0, -6, -7, -11);

  // Paneles solares orientados al Sol
  const solarTex = solarTexture();
  const panelMat = new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.35, metalness: 0.5, side: THREE.DoubleSide });
  const beacons: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const x = -24 - i * 7.5, z = -2 - i * 1.5;
    const y = heightAt(x, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.2, 8), std(0x9aa0a8, 0.5, 0.7));
    pole.position.set(x, y + 1.6, z);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3), panelMat);
    panel.position.set(x, y + 3.5, z);
    panel.lookAt(panel.position.clone().add(SUN_DIR));
    base.add(pole, panel);
  }
  // Antena de comunicaciones
  const dishG = new THREE.Group();
  const dx = 13, dz = -22;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 5, 8), std(0x9aa0a8, 0.5, 0.7));
  mast.position.y = 2.5;
  const dish = new THREE.Mesh(new THREE.SphereGeometry(2.4, 28, 12, 0, Math.PI * 2, 0, 0.95), new THREE.MeshStandardMaterial({ color: 0xe8ebee, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide }));
  dish.rotation.x = Math.PI;
  dish.position.y = 7.6;
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2, 6), std(0x8a8f96));
  feed.position.y = 6.3;
  const dishHead = new THREE.Group();
  dishHead.add(dish, feed);
  dishHead.rotation.z = 0.55;
  dishG.add(mast, dishHead);
  dishG.position.set(dx, heightAt(dx, dz), dz);
  base.add(dishG);
  // Plataforma de aterrizaje con balizas
  const padTex = padTexture();
  const lz = new THREE.Mesh(new THREE.CircleGeometry(8, 48), new THREE.MeshStandardMaterial({ map: padTex, roughness: 0.95 }));
  lz.rotation.x = -Math.PI / 2;
  lz.position.set(-16, heightAt(-16, 9) + 0.06, 9);
  lz.receiveShadow = true;
  base.add(lz);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x35d8f2 });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), beaconMat.clone());
    b.position.set(-16 + Math.cos(a) * 8.3, heightAt(-16, 9) + 0.25, 9 + Math.sin(a) * 8.3);
    beacons.push(b);
    base.add(b);
  }
  // Luces de trabajo
  for (const [x, z] of [[11, 2], [-3, -18]] as const) {
    const y = heightAt(x, z);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 6, 6), std(0x8a8f96, 0.5, 0.7));
    m.position.set(x, y + 3, z);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.4), new THREE.MeshBasicMaterial({ color: 0xfff1cf }));
    lamp.position.set(x, y + 6.05, z);
    const pl = new THREE.PointLight(0xffe2b0, 160, 34, 1.8);
    pl.position.set(x, y + 5.7, z);
    base.add(m, lamp, pl);
  }
  // Astronautas (modelo de NASA) junto a la base
  const AS = 1.95 / models.astronaut.size.y;
  for (const [x, z, r] of [[9.5, 6, -0.6], [-4.5, 15.5, 2.4]] as const) {
    const a = modelMesh(models.astronaut, "body", { roughness: 0.8 });
    a.scale.setScalar(AS);
    a.rotation.y = r;
    a.position.set(x, heightAt(x, z), z);
    base.add(a);
  }
  shadowed(base);
  root.add(base);

  // ── Rover presurizado (Space Exploration Vehicle) ──────────────────────────
  const rover = new THREE.Group();
  const roverMesh = modelMesh(models.rover, "body", { roughness: 0.6, metalness: 0.2 });
  rover.add(roverMesh);
  const rx = 2, rz = 20;
  rover.position.set(rx, heightAt(rx, rz) - 0.05, rz);
  rover.rotation.y = -2.0;
  root.add(shadowed(rover));

  // ── Nave: vehículo en su plataforma con torre de servicio ──────────────────
  const ship = new THREE.Group();
  const sx = -46, sz = -18;
  const sy = heightAt(sx, sz);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, 1.2, 40), new THREE.MeshStandardMaterial({ map: padTex, roughness: 0.95 }));
  pad.position.y = 0.3;
  const RS = 2.3;
  const rocket = modelMesh(models.rocket, "body", { roughness: 0.55, metalness: 0.15 });
  rocket.scale.setScalar(RS);
  rocket.position.y = 0.9;
  const TS = (models.rocket.size.y * RS * 0.92) / models.tower.size.y;
  const tower = modelMesh(models.tower, "body", { roughness: 0.7, metalness: 0.4 });
  tower.scale.setScalar(TS);
  tower.position.set(-7.4, 0.9, 1.5);
  tower.rotation.y = Math.PI / 2;
  const shipLight = new THREE.PointLight(0xfff0d8, 420, 60, 1.7);
  shipLight.position.set(6, 9, 8);
  ship.add(pad, rocket, tower, shipLight);
  ship.position.set(sx, sy, sz);
  root.add(shadowed(ship));
  const shipTop = models.rocket.size.y * RS + 0.9;

  // ── Estación en órbita ─────────────────────────────────────────────────────
  const station = buildStation(models.iss);
  const stationG = new THREE.Group();
  stationG.add(station.group);
  station.group.scale.setScalar(4.4);
  station.group.rotation.set(0.5, 0.4, -0.18);
  const stationPos = new THREE.Vector3(-34, 60, -92);
  stationG.position.copy(stationPos);
  root.add(stationG);

  const sphere = (c: THREE.Vector3, r: number): THREE.Sphere => new THREE.Sphere(c, r);
  const baseY = heightAt(4, -4);
  const modules: Record<ModuleId, SiteModule> = {
    nave: {
      id: "nave",
      group: ship,
      anchor: new THREE.Vector3(sx, sy + shipTop + 2.5, sz),
      pick: sphere(new THREE.Vector3(sx, sy + shipTop / 2, sz), shipTop * 0.55),
      focus: { target: new THREE.Vector3(sx, sy + shipTop * 0.48, sz), offset: new THREE.Vector3(28, 4, 46), minDist: 24, maxDist: 110, ground: true },
      materials: mats(rocket).concat(mats(tower)),
    },
    estacion: {
      id: "estacion",
      group: stationG,
      anchor: stationPos.clone().add(new THREE.Vector3(0, 13, 0)),
      pick: sphere(stationPos.clone(), 22),
      focus: { target: stationPos.clone(), offset: new THREE.Vector3(-44, -13, 52), minDist: 30, maxDist: 150, ground: false, minPolar: 1.25 },
      materials: station.materials,
    },
    rover: {
      id: "rover",
      group: rover,
      anchor: new THREE.Vector3(rx, rover.position.y + 5.6, rz),
      pick: sphere(new THREE.Vector3(rx, rover.position.y + 2, rz), 3.6),
      focus: { target: new THREE.Vector3(rx, rover.position.y + 1.9, rz), offset: new THREE.Vector3(-8.5, 3.4, 10.5), minDist: 7, maxDist: 30, ground: true },
      materials: mats(rover),
    },
    base: {
      id: "base",
      group: base,
      anchor: new THREE.Vector3(5, baseY + 9.2, -4),
      pick: sphere(new THREE.Vector3(5, baseY + 3, -7), 13),
      focus: { target: new THREE.Vector3(4, baseY + 3.2, -7), offset: new THREE.Vector3(16, 9, 32), minDist: 16, maxDist: 80, ground: true },
      materials: mats(base).filter((m) => m.color.getHex() === habTint),
    },
  };

  const update = (t: number): void => {
    station.group.rotation.y = 0.4 + t * 0.02;
    stationG.position.y = stationPos.y + Math.sin(t * 0.12) * 1.2;
    dishG.rotation.y = t * 0.08;
    beacons.forEach((b, i) => {
      const on = (Math.floor(t * 2.2) + i) % 10 < 3;
      (b.material as THREE.MeshBasicMaterial).color.setHex(on ? 0x9ff3ff : 0x1c6f80);
    });
  };

  return { root, modules, update };
}
