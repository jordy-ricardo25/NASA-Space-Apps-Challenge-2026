/**
 * Mundo 3D del centro de mando (three.js, solo en el navegador).
 *
 * Un único WebGLRenderer persiste mientras se navega entre rutas: la vista
 * general del sitio lunar, el acercamiento a cada módulo y el interior de su
 * cabina con la llama. Aquí también corre el motor físico en tiempo real.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { L } from "@/content/i18n";
import type { ModuleId } from "@/content/modules";
import { getMaterial } from "@/features/fire/engine/materials";
import { act as simAct, ignite as simIgnite, makeState, step, type ActionKey, type SimConfig, type SimState } from "@/features/fire/engine/sim";
import { tigNow } from "@/features/fire/engine/physics";
import { emptyHistory, fireStore, type FireHistory, type FireSnapshot } from "@/features/fire/store";
import { FireRig, flameMaterial } from "./flame";
import { buildInterior, type Interior } from "./interiors";
import { buildEarth, buildLights, buildStars } from "./sky";
import { buildSite, type Site } from "./site";
import { buildTerrain } from "./terrain";

export type ViewMode = "overview" | "focus" | "cabin" | "ambient";

export interface ViewState {
  mode: ViewMode;
  module: ModuleId | null;
  /** Desplazamiento (px) del centro óptico para dejar libre el espacio de los paneles. */
  shiftX: number;
  shiftY: number;
}

export interface WorldHooks {
  onProgress: (p: number, stage: L) => void;
  onReady: () => void;
  onPick: (id: ModuleId) => void;
  onHover: (id: ModuleId | null) => void;
  /** Capa negra para el fundido entre exterior e interior. */
  fade: HTMLElement;
  quality: "auto" | "high" | "low";
  reduceMotion: boolean;
}

const OVERVIEW = { pos: new THREE.Vector3(14, 8.5, 70), target: new THREE.Vector3(-15, 15, -20) };
const AMBIENT = { pos: new THREE.Vector3(60, 34, 96), target: new THREE.Vector3(-8, 10, -16) };
const ease = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const HIST_MAX = 240;

export class World {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly cam = new THREE.PerspectiveCamera(42, 1, 0.5, 4000);
  private readonly camI = new THREE.PerspectiveCamera(48, 1, 0.05, 40);
  private readonly ctrl: OrbitControls;
  private readonly ctrlI: OrbitControls;
  private readonly ins = new THREE.Scene();
  private readonly camIns = new THREE.PerspectiveCamera(35, 1, 0.05, 5);
  private readonly flEarth: THREE.Mesh;
  private readonly rig = new FireRig();
  private readonly interiors = new Map<ModuleId, Interior>();
  private site: Site | null = null;
  private earth: THREE.Group | null = null;
  private view: ViewState = { mode: "overview", module: null, shiftX: 0, shiftY: 0 };
  private shown: "world" | "cabin" = "world";
  private cabinModule: ModuleId | null = null;
  private tween: { fp: THREE.Vector3; ft: THREE.Vector3; tp: THREE.Vector3; tt: THREE.Vector3; t: number; dur: number } | null = null;
  private readonly target = OVERVIEW.target.clone();
  private readonly pointer = new THREE.Vector2(0, 0);
  private readonly ray = new THREE.Raycaster();
  private hovered: ModuleId | null = null;
  private down: [number, number] | null = null;
  private raf = 0;
  private last = performance.now();
  private time = 0;
  private disposed = false;
  private ready = false;
  private dpr = 1;
  private steps = 30;
  private fAvg = 16;
  private fN = 0;
  private anchorT = 0;
  private anchors: HTMLElement[] = [];
  private insetEl: HTMLElement | null = null;
  private w = 1;
  private h = 1;
  // Motor físico
  private S: SimState | null = null;
  private hist: FireHistory = emptyHistory();
  private acc = 0;
  private pubT = 0;
  private histNext = 0;
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();
  /** Centro de la vista actual: el arrastre lateral no se aleja de él más de `panRadius`. */
  private readonly home = OVERVIEW.target.clone();
  private panRadius = 40;
  private heightAt: ((x: number, z: number) => number) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly hooks: WorldHooks) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.shadowMap.enabled = hooks.quality !== "low";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.dpr = Math.min(window.devicePixelRatio || 1, hooks.quality === "low" ? 1 : 2);
    this.steps = hooks.quality === "low" ? 20 : 30;
    this.scene.background = new THREE.Color(0x01040a);

    this.cam.position.copy(OVERVIEW.pos);
    this.cam.lookAt(this.target);
    this.ctrl = new OrbitControls(this.cam, canvas);
    this.ctrl.enableDamping = true;
    // Arrastre libre en todas las vistas: girar (clic), desplazar (clic derecho o Mayús) y acercar (rueda).
    this.ctrl.enablePan = true;
    this.ctrl.screenSpacePanning = true;
    this.ctrl.panSpeed = 0.7;
    this.ctrl.zoomSpeed = 0.8;
    this.ctrl.rotateSpeed = 0.55;
    this.ctrl.autoRotateSpeed = 0.3;
    this.ctrl.enabled = false;
    this.ctrl.addEventListener("start", () => (this.ctrl.autoRotate = false));
    this.ctrlI = new OrbitControls(this.camI, canvas);
    this.ctrlI.enableDamping = true;
    this.ctrlI.enablePan = false;
    this.ctrlI.rotateSpeed = 0.6;
    this.ctrlI.enabled = false;

    // Comparador: la misma vela en la Tierra (1 g)
    this.ins.background = new THREE.Color(0x060b12);
    this.flEarth = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), flameMaterial());
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 6), new THREE.MeshBasicMaterial({ color: 0x26221d }));
    wick.position.y = -0.1;
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 16), new THREE.MeshBasicMaterial({ color: 0x8b8275 }));
    candle.position.y = -0.38;
    this.ins.add(this.flEarth, wick, candle);
    this.camIns.position.set(0, 0.03, 1.15);
    this.camIns.lookAt(0, 0.03, 0);

    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("pointerleave", this.onLeave);
    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.resize();
    void this.init();
  }

  // ── Carga ────────────────────────────────────────────────────────────────
  private async init(): Promise<void> {
    const { onProgress } = this.hooks;
    onProgress(0.06, { es: "Encendiendo el motor 3D", en: "Powering up the 3D engine" });
    const loader = new THREE.TextureLoader();
    const earthMap = await loader.loadAsync("/textures/earth.jpg");
    if (this.disposed) return;
    onProgress(0.16, { es: "Trazando la superficie lunar", en: "Plotting the lunar surface" });
    await new Promise((r) => setTimeout(r, 30));
    const terrain = buildTerrain();
    this.heightAt = terrain.heightAt;
    this.scene.add(terrain.mesh);
    this.scene.add(buildStars());
    this.earth = buildEarth(earthMap);
    this.scene.add(this.earth);
    const lights = buildLights(this.renderer.shadowMap.enabled);
    this.scene.add(lights.sun, lights.sun.target, lights.fill);
    onProgress(0.28, { es: "Cargando modelos de NASA", en: "Loading NASA models" });
    const labels: Record<string, L> = {
      iss: { es: "Estación espacial acoplada", en: "Space station docked" },
      rover: { es: "Rover presurizado listo", en: "Pressurised rover ready" },
      "habitat-a": { es: "Hábitat lunar desplegado", en: "Lunar habitat deployed" },
      "habitat-b": { es: "Módulos de la base en línea", en: "Base modules online" },
      rocket: { es: "Nave en plataforma", en: "Spacecraft on the pad" },
      tower: { es: "Torre de servicio conectada", en: "Service tower connected" },
      astronaut: { es: "Tripulación en superficie", en: "Crew on the surface" },
    };
    this.site = await buildSite(terrain.heightAt, (done, total, name) =>
      onProgress(0.28 + 0.56 * (done / total), labels[name] ?? { es: "Cargando", en: "Loading" }),
    );
    if (this.disposed) return;
    this.scene.add(this.site.root);
    onProgress(0.9, { es: "Calibrando el modelo de combustión", en: "Calibrating the combustion model" });
    await new Promise((r) => setTimeout(r, 30));
    this.renderer.compile(this.scene, this.cam);
    onProgress(0.97, { es: "Sincronizando el centro de mando", en: "Synchronising the command centre" });
    this.ready = true;
    this.applyView(true);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    await new Promise((r) => setTimeout(r, 120));
    onProgress(1, { es: "Sistemas en línea", en: "Systems online" });
    this.hooks.onReady();
  }

  // ── Vista ────────────────────────────────────────────────────────────────
  /** Cambia la vista (la interfaz la llama cuando cambia la ruta). */
  setView(v: ViewState): void {
    const prev = this.view;
    this.view = v;
    if (!this.ready) return;
    const structural = prev.mode !== v.mode || prev.module !== v.module;
    if (structural) this.applyView(false);
    else this.updateOffset();
  }

  private applyView(instant: boolean): void {
    const v = this.view;
    const wantCabin = v.mode === "cabin" && !!v.module;
    if (wantCabin !== (this.shown === "cabin") || (wantCabin && this.cabinModule !== v.module)) {
      if (instant) this.swapScene(wantCabin);
      else {
        this.hooks.fade.style.opacity = "1";
        setTimeout(() => {
          if (this.disposed) return;
          this.swapScene(this.view.mode === "cabin" && !!this.view.module);
          this.hooks.fade.style.opacity = "0";
        }, 320);
      }
    }
    if (!wantCabin) this.flyTo(instant || this.shown === "cabin");
    this.updateOffset();
    this.setHover(null);
  }

  private swapScene(cabin: boolean): void {
    this.shown = cabin ? "cabin" : "world";
    this.ctrl.enabled = false;
    this.ctrlI.enabled = false;
    if (cabin && this.view.module) {
      const id = this.view.module;
      let it = this.interiors.get(id);
      if (!it) {
        it = buildInterior(id);
        this.interiors.set(id, it);
      }
      this.cabinModule = id;
      it.scene.add(this.rig.root);
      this.rig.attach(it.spec);
      if (this.S) this.rig.setMaterial(getMaterial(this.S.cfg.mat));
      this.camI.position.copy(it.spec.camera);
      this.ctrlI.target.copy(it.spec.sample);
      this.ctrlI.minDistance = it.spec.minDist;
      this.ctrlI.maxDistance = it.spec.maxDist;
      this.ctrlI.enabled = true;
      this.ctrlI.update();
    } else {
      this.cabinModule = null;
      this.flyTo(true);
    }
    this.updateOffset();
  }

  private pose(): { pos: THREE.Vector3; target: THREE.Vector3 } {
    const v = this.view;
    if ((v.mode === "focus" || v.mode === "cabin") && v.module && this.site) {
      const f = this.site.modules[v.module].focus;
      return { pos: f.target.clone().add(f.offset), target: f.target.clone() };
    }
    return v.mode === "ambient" ? AMBIENT : OVERVIEW;
  }

  private flyTo(instant: boolean): void {
    const { pos, target } = this.pose();
    // Si el usuario movió la cámara, el vuelo parte de donde la dejó.
    if (this.ctrl.enabled) this.target.copy(this.ctrl.target);
    this.ctrl.enabled = false;
    if (instant || this.hooks.reduceMotion) {
      this.cam.position.copy(pos);
      this.target.copy(target);
      this.cam.lookAt(target);
      this.tween = null;
      this.afterFly();
    } else {
      this.tween = { fp: this.cam.position.clone(), ft: this.target.clone(), tp: pos.clone(), tt: target.clone(), t: 0, dur: 1.7 };
    }
  }

  /** Al terminar el vuelo se entregan los mandos: toda vista 3D se puede girar, desplazar y acercar. */
  private afterFly(): void {
    const v = this.view;
    const c = this.ctrl;
    c.minPolarAngle = 0;
    if (v.mode === "focus" && v.module && this.site) {
      const f = this.site.modules[v.module].focus;
      c.target.copy(f.target);
      c.minDistance = f.minDist;
      c.maxDistance = f.maxDist;
      c.maxPolarAngle = f.ground ? Math.PI * 0.492 : Math.PI;
      c.minPolarAngle = f.minPolar ?? 0;
      c.autoRotateSpeed = 0.3;
      c.autoRotate = !this.hooks.reduceMotion;
      this.panRadius = f.maxDist * 0.35;
    } else {
      const base = v.mode === "ambient" ? AMBIENT : OVERVIEW;
      c.target.copy(base.target);
      c.minDistance = 36;
      c.maxDistance = 210;
      c.maxPolarAngle = Math.PI * 0.56;
      c.autoRotateSpeed = 0.12;
      c.autoRotate = v.mode === "ambient" && !this.hooks.reduceMotion;
      this.panRadius = 48;
    }
    this.home.copy(c.target);
    c.enabled = true;
    c.update();
  }

  /** Mantiene la cámara cerca de la escena y por encima del terreno. */
  private bound(): void {
    const c = this.ctrl;
    const d = this.tmp.copy(c.target).sub(this.home);
    if (d.length() > this.panRadius) {
      d.setLength(this.panRadius).add(this.home).sub(c.target);
      c.target.add(d);
      this.cam.position.add(d);
    }
    if (this.heightAt) {
      const floor = this.heightAt(this.cam.position.x, this.cam.position.z) + 1.8;
      if (this.cam.position.y < floor) this.cam.position.y = floor;
    }
  }

  private updateOffset(): void {
    const { shiftX, shiftY } = this.view;
    const cam = this.shown === "cabin" ? this.camI : this.cam;
    for (const c of [this.cam, this.camI]) c.clearViewOffset();
    if (shiftX || shiftY) cam.setViewOffset(this.w, this.h, shiftX, shiftY, this.w, this.h);
  }

  // ── Controles de cámara para la interfaz ─────────────────────────────────
  zoom(dir: 1 | -1): void {
    const c = this.shown === "cabin" ? this.ctrlI : this.ctrl;
    if (!c.enabled) return;
    const cam = c.object;
    const d = cam.position.distanceTo(c.target);
    const nd = THREE.MathUtils.clamp(d * (dir > 0 ? 0.8 : 1.25), c.minDistance, c.maxDistance);
    cam.position.sub(c.target).setLength(nd).add(c.target);
    c.update();
  }

  resetCamera(): void {
    if (this.shown === "cabin" && this.cabinModule) {
      const it = this.interiors.get(this.cabinModule);
      if (it) {
        this.camI.position.copy(it.spec.camera);
        this.ctrlI.target.copy(this.rig.flamePos.lengthSq() ? this.rig.flamePos : it.spec.sample);
        this.ctrlI.update();
      }
    } else this.flyTo(false);
  }

  /** Activa o desactiva el giro automático; devuelve el nuevo estado. */
  toggleRotate(): boolean {
    this.ctrl.autoRotate = !this.ctrl.autoRotate;
    return this.ctrl.autoRotate;
  }

  setTracers(on: boolean): void {
    this.rig.showTracers = on;
  }

  // ── Escenario de fuego ───────────────────────────────────────────────────
  /** Aplica la configuración del escenario; reinicia si cambia el material, el modo o el volumen. */
  configure(cfg: SimConfig): void {
    const S = this.S;
    if (!S || S.cfg.mat !== cfg.mat || S.cfg.volume !== cfg.volume || S.cfg.mode !== cfg.mode || S.cfg.g !== cfg.g) {
      this.resetFire(cfg);
      return;
    }
    const atmosphere = S.cfg.o2 !== cfg.o2 || S.cfg.P !== cfg.P;
    S.cfg = { ...cfg };
    if (atmosphere && S.fire === "none") {
      S.cab.O2 = cfg.o2;
      S.O2l = cfg.o2;
      S.P = cfg.P;
    }
    fireStore.set({ cfg });
  }

  resetFire(cfg?: SimConfig): void {
    const c = cfg ?? this.S?.cfg;
    if (!c) return;
    this.S = makeState(c);
    step(this.S, 0.05);
    this.hist = emptyHistory();
    this.histNext = 0;
    this.acc = 0;
    this.rig.setMaterial(getMaterial(c.mat));
    fireStore.set({ cfg: c, hist: this.hist, histTick: 0 });
    this.publish();
  }

  ignite(): boolean {
    if (!this.S) return false;
    const ok = simIgnite(this.S);
    this.publish();
    return ok;
  }

  action(key: ActionKey): void {
    if (!this.S) return;
    simAct(this.S, key);
    this.publish();
  }

  private publish(): void {
    const S = this.S;
    if (!S) return;
    const snap: FireSnapshot = {
      t: S.t, fire: S.fire, flame: S.flame, Q: S.Q, v: S.v, M: S.M, loc: S.loc, locLo: S.locLo, locHi: S.locHi, U: S.U,
      O2l: S.O2l, CO2l: S.CO2l, Ts: S.Ts, tig: tigNow(getMaterial(S.cfg.mat), S.P), D: S.D, K: S.K, soot: S.soot, P: S.P,
      ventA: S.ventA, x: S.x, mist: S.mist, Tf: S.Tf, cab: { ...S.cab }, obsc: S.obsc, det: S.det, alarm: S.alarm,
      alarmT: S.alarmT, tIgn: S.tIgn, act: { ...S.act }, log: S.log.slice(-6),
    };
    fireStore.set({ snap });
  }

  private advance(dt: number): void {
    const S = this.S;
    if (!S) return;
    const st = fireStore.get();
    if (!st.paused) {
      this.acc += dt * st.speed;
      let n = 0;
      while (this.acc >= 0.1 && n++ < 80) {
        step(S, 0.1);
        this.acc -= 0.1;
        if (S.t >= this.histNext) {
          const hst = this.hist;
          hst.t.push(S.t);
          hst.q.push(S.Q);
          hst.o2.push(S.O2l * (1 - S.CO2l / 100));
          hst.loc.push(S.loc);
          hst.co.push(S.cab.CO);
          hst.co2.push(S.cab.CO2);
          hst.det.push(S.det);
          if (hst.t.length > HIST_MAX) (Object.keys(hst) as (keyof FireHistory)[]).forEach((k) => hst[k].shift());
          this.histNext = S.t + 1;
          fireStore.set({ histTick: fireStore.get().histTick + 1 });
        }
      }
      if (n >= 80) this.acc = 0;
    }
    this.pubT += dt;
    if (this.pubT > 0.14) {
      this.pubT = 0;
      this.publish();
    }
  }

  // ── Interacción ──────────────────────────────────────────────────────────
  private readonly onMove = (e: PointerEvent): void => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (this.view.mode === "overview" && this.site && !this.tween) this.setHover(this.pickAt());
  };
  private readonly onDown = (e: PointerEvent): void => {
    this.down = [e.clientX, e.clientY];
  };
  private readonly onUp = (e: PointerEvent): void => {
    if (!this.down) return;
    const moved = Math.hypot(e.clientX - this.down[0], e.clientY - this.down[1]);
    this.down = null;
    if (moved < 5 && this.view.mode === "overview") {
      const id = this.pickAt();
      if (id) this.hooks.onPick(id);
    }
  };
  private readonly onLeave = (): void => {
    this.pointer.set(0, 0);
    this.setHover(null);
  };
  private readonly onVisibility = (): void => {
    if (document.hidden) cancelAnimationFrame(this.raf);
    else {
      this.last = performance.now();
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(this.frame);
    }
  };

  private pickAt(): ModuleId | null {
    if (!this.site) return null;
    this.ray.setFromCamera(this.pointer, this.cam);
    let best: ModuleId | null = null;
    let bestD = Infinity;
    for (const m of Object.values(this.site.modules)) {
      const hit = this.ray.ray.intersectSphere(m.pick, this.tmp);
      if (hit) {
        const d = hit.distanceTo(this.cam.position);
        if (d < bestD) {
          bestD = d;
          best = m.id;
        }
      }
    }
    return best;
  }

  /** Resalta un módulo (también lo usan las etiquetas de la interfaz). */
  setHover(id: ModuleId | null): void {
    if (id === this.hovered) return;
    this.hovered = id;
    this.canvas.style.cursor = id ? "pointer" : "grab";
    this.hooks.onHover(id);
  }

  private readonly resize = (): void => {
    const r = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.w, this.h, false);
    for (const c of [this.cam, this.camI]) {
      c.aspect = this.w / this.h;
      c.updateProjectionMatrix();
    }
    this.rig.setViewportHeight(this.h * this.dpr);
    this.updateOffset();
  };

  // ── Bucle de render ──────────────────────────────────────────────────────
  private readonly frame = (now: number): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const t = this.time;
    this.advance(dt);

    if (this.shown === "cabin" && this.cabinModule) {
      const it = this.interiors.get(this.cabinModule)!;
      const S = this.S;
      if (S) {
        const paused = fireStore.get().paused;
        this.rig.update(S, t, paused ? 0 : Math.min(0.12, dt) * Math.min(fireStore.get().speed, 4), this.steps, it.fog);
        // La cámara acompaña suavemente al frente de llama
        const k = Math.min(1, dt * 1.4);
        this.tmp.copy(this.rig.flamePos).sub(this.ctrlI.target).multiplyScalar(k);
        this.ctrlI.target.add(this.tmp);
        this.camI.position.add(this.tmp);
      }
      this.ctrlI.update();
      this.renderer.setScissorTest(false);
      this.renderer.setViewport(0, 0, this.w, this.h);
      this.renderer.render(it.scene, this.camI);
      this.renderInset(t);
    } else {
      this.site?.update(t);
      if (this.earth) (this.earth.userData.spin as THREE.Mesh).rotation.y += dt * 0.004;
      if (this.tween) {
        const tw = this.tween;
        tw.t += dt;
        const k = ease(Math.min(1, tw.t / tw.dur));
        this.cam.position.lerpVectors(tw.fp, tw.tp, k);
        this.target.lerpVectors(tw.ft, tw.tt, k);
        this.cam.lookAt(this.target);
        if (tw.t >= tw.dur) {
          this.tween = null;
          this.afterFly();
        }
      } else if (this.ctrl.enabled) {
        this.ctrl.update();
        this.bound();
      }
      this.highlight(t);
      this.renderer.setScissorTest(false);
      this.renderer.setViewport(0, 0, this.w, this.h);
      this.renderer.render(this.scene, this.cam);
    }
    this.placeAnchors(dt);
    this.adapt(dt);
  };

  /** Comparador "misma llama en la Tierra" dibujado dentro del recuadro de la interfaz. */
  private renderInset(t: number): void {
    const el = this.insetEl;
    if (!el || !el.isConnected) return;
    const b = el.getBoundingClientRect();
    if (b.width < 8) return;
    const c = this.canvas.getBoundingClientRect();
    const u = (this.flEarth.material as THREE.ShaderMaterial).uniforms;
    (u.uDir!.value as THREE.Vector3).set(0, 1, 0);
    u.uR!.value = 0.05;
    u.uS!.value = 4.6;
    u.uHW!.value = 0;
    u.uSoot!.value = 0.95;
    u.uI!.value = 1.15;
    u.uT!.value = t * 1.4;
    u.uFl!.value = 0.28;
    u.uCool!.value = 0;
    u.uBound!.value = 0.34;
    u.uN!.value = Math.min(this.steps, 24);
    this.flEarth.scale.setScalar(0.34);
    this.flEarth.position.set(0, -0.01, 0);
    this.camIns.aspect = b.width / b.height;
    this.camIns.updateProjectionMatrix();
    const x = b.left - c.left, y = c.bottom - b.bottom;
    this.renderer.setScissorTest(true);
    this.renderer.setScissor(x, y, b.width, b.height);
    this.renderer.setViewport(x, y, b.width, b.height);
    this.renderer.render(this.ins, this.camIns);
    this.renderer.setScissorTest(false);
  }

  private highlight(t: number): void {
    if (!this.site) return;
    const overview = this.view.mode === "overview";
    for (const m of Object.values(this.site.modules)) {
      const on = overview && m.id === this.hovered;
      const k = on ? 0.2 + 0.07 * Math.sin(t * 5) : 0;
      for (const mat of m.materials) mat.emissive.setRGB(0.1 * k, 0.75 * k, 0.9 * k);
    }
  }

  /** Proyecta las etiquetas de los módulos sobre la pantalla (elementos con data-anchor). */
  private placeAnchors(dt: number): void {
    this.anchorT -= dt;
    if (this.anchorT <= 0) {
      this.anchorT = 0.4;
      this.anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-anchor]"));
      this.insetEl = document.querySelector<HTMLElement>("[data-inset='earth']");
    }
    if (!this.site || this.shown === "cabin") return;
    const r = this.canvas.getBoundingClientRect();
    for (const el of this.anchors) {
      const m = this.site.modules[el.dataset.anchor as ModuleId];
      if (!m) continue;
      this.tmp2.copy(m.anchor);
      if (m.id === "estacion") this.tmp2.y = m.group.position.y + 13;
      this.tmp2.project(this.cam);
      const visible = this.tmp2.z < 1 && Math.abs(this.tmp2.x) < 1.1 && Math.abs(this.tmp2.y) < 1.1;
      const x = ((this.tmp2.x + 1) / 2) * r.width, y = ((1 - this.tmp2.y) / 2) * r.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = visible ? "visible" : "hidden";
    }
  }

  /** Calidad automática: si baja la fluidez, reduce pasos de la llama y resolución. */
  private adapt(dt: number): void {
    if (this.hooks.quality !== "auto") return;
    this.fAvg = this.fAvg * 0.95 + dt * 1000 * 0.05;
    if (++this.fN < 90) return;
    this.fN = 0;
    if (this.fAvg > 27 && (this.dpr > 1 || this.steps > 16)) {
      if (this.steps > 16) this.steps -= 6;
      else {
        this.dpr = Math.max(1, this.dpr - 0.25);
        this.resize();
      }
    } else if (this.fAvg < 12 && this.steps < 30) this.steps += 4;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.ctrl.dispose();
    this.ctrlI.dispose();
    const free = (o: THREE.Object3D): void => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        const map = (mat as THREE.MeshStandardMaterial).map;
        map?.dispose();
        mat.dispose();
      }
    };
    this.scene.traverse(free);
    this.ins.traverse(free);
    this.interiors.forEach((it) => it.scene.traverse(free));
    this.renderer.dispose();
  }
}
