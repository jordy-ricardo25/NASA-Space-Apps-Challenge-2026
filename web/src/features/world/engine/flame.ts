/**
 * Llama volumétrica y banco de combustión.
 *
 * La llama es un shader de "raymarching" (portado de la Alpha): por cada píxel
 * recorre un volumen y suma luz. Su forma, color y parpadeo salen en cada
 * cuadro del motor físico: con gravedad se estira hacia arriba y se vuelve
 * amarilla (hollín); en microgravedad queda azul y casi esférica; con
 * ventilación se arrastra a favor del flujo.
 */
import * as THREE from "three";
import { getMaterial, type Material } from "@/features/fire/engine/materials";
import { buoyFlow, pyroX, tigNow } from "@/features/fire/engine/physics";
import type { SimState } from "@/features/fire/engine/sim";
import { clamp, sat } from "@/shared/lib/units";

export interface InteriorSpec {
  /** Centro y semiejes del volumen útil (confina humo y trazadores). */
  center: THREE.Vector3;
  half: THREE.Vector3;
  /** Dirección contraria a la gravedad y dirección de la ventilación. */
  up: THREE.Vector3;
  ventDir: THREE.Vector3;
  /** Centro de la muestra, su eje largo y su normal hacia la cabina. */
  sample: THREE.Vector3;
  axis: THREE.Vector3;
  normal: THREE.Vector3;
  /** Cámara inicial. */
  camera: THREE.Vector3;
  minDist: number;
  maxDist: number;
  fog: number;
}

const FLAME_VS = `varying vec3 vP;varying vec3 vC;void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz-modelMatrix[3].xyz;vC=cameraPosition-modelMatrix[3].xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const FLAME_FS = `precision highp float;varying vec3 vP;varying vec3 vC;
uniform vec3 uDir,uAxis;uniform float uR,uS,uHW,uSoot,uI,uT,uFl,uCool,uBound;uniform int uN;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fld(vec3 p,out float ax){ax=dot(p,uDir);vec3 q=p-ax*uDir;float h=dot(q,uAxis);q-=clamp(h,-uHW,uHW)*uAxis;
 float k=ax>0.?mix(1.,uS,smoothstep(0.,uR*.7,ax)):.82;float a=ax/k;float taper=1.+max(ax,0.)/(uR*uS+1e-4)*1.15*smoothstep(1.2,2.6,uS);float r=length(q)*taper;
 float d=sqrt(r*r+a*a)-uR;vec3 w=p*(7./max(uR,.02))-uDir*uT*3.2;float n=n3(w)*.62+n3(w*2.1+3.)*.38;return d+(n-.5)*uFl*uR;}
void main(){vec3 ro=vC,rd=normalize(vP-vC);float b=dot(ro,rd),c=dot(ro,ro)-uBound*uBound,dsc=b*b-c;if(dsc<0.)discard;dsc=sqrt(dsc);float t0=max(-b-dsc,0.),t1=-b+dsc;if(t1<=0.)discard;
 float dt=(t1-t0)/float(uN);float jit=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);float t=t0+dt*jit*.6;vec3 acc=vec3(0.);
 vec3 blue=mix(vec3(.13,.32,1.),vec3(.38,.2,.95),uCool);vec3 yel=vec3(1.,.62,.16),hot=vec3(1.,.9,.62);
 float sh=max(uR*(mix(.2,.34,uSoot)),.004);
 for(int i=0;i<uN;i++){vec3 p=ro+rd*t;float ax;float d=fld(p,ax);
  float shell=exp(-pow(d/sh,2.));float inner=smoothstep(.1*uR,-.65*uR,d);float along=smoothstep(-.35*uR,uR*1.1,ax);
  vec3 e=blue*shell*1.9*(1.-smoothstep(.0,.42,uSoot*along));
  float lum=uSoot*(inner*.5+shell*.9)*along;e+=mix(yel,hot,inner*.5)*lum*3.;
  acc+=e*dt/max(uR,.02)*(uCool>.5?.3:1.);t+=dt;}
 acc*=uI*(uCool>.5?.55:.62);float lm=max(max(acc.r,acc.g),acc.b)+1e-4;vec3 hue=acc/lm;float sat2=1.-exp(-lm*1.5);vec3 col=hue*sat2;col+=vec3(1.,.95,.85)*pow(max(sat2-.82,0.)/.18,2.)*.35;vec3 oc=pow(col,vec3(.8));float al=clamp(sat2*1.15,0.,.94);gl_FragColor=vec4(oc,al);}`;

/** Material del shader de la llama. */
export function flameMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: FLAME_VS,
    fragmentShader: FLAME_FS,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    side: THREE.BackSide,
    toneMapped: false,
    uniforms: {
      uDir: { value: new THREE.Vector3(1, 0, 0) },
      uAxis: { value: new THREE.Vector3(0, 1, 0) },
      uR: { value: 0.1 },
      uS: { value: 1 },
      uHW: { value: 0 },
      uSoot: { value: 0 },
      uI: { value: 0 },
      uT: { value: 0 },
      uFl: { value: 0.1 },
      uCool: { value: 0 },
      uBound: { value: 1 },
      uN: { value: 30 },
    },
  });
}

const SMOKE_N = 900;
const TRACER_N = 240;

/** Banco de combustión: muestra, llama, luz, humo y trazadores del flujo de aire. */
export class FireRig {
  readonly root = new THREE.Group();
  readonly flame: THREE.Mesh;
  readonly flamePos = new THREE.Vector3();
  private readonly fuel = new THREE.Group();
  private readonly light: THREE.PointLight;
  private readonly sheet: THREE.Mesh;
  private readonly wire: THREE.Mesh;
  private readonly drop: THREE.Mesh;
  private readonly tethers: THREE.LineSegments;
  private readonly sampleMat: THREE.ShaderMaterial;
  private readonly smoke: THREE.Points;
  private readonly tracers: THREE.Points;
  private readonly smokeAge = new Float32Array(SMOKE_N).fill(-1);
  private smokeI = 0;
  private spec: InteriorSpec | null = null;
  private mat: Material = getMaterial("sibal");
  private readonly flow = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private readonly short = new THREE.Vector3();
  showTracers = true;

  constructor() {
    this.sampleMat = new THREE.ShaderMaterial({
      uniforms: { uX: { value: 0 }, uDirS: { value: 1 }, uGlow: { value: 0 }, uCol: { value: new THREE.Color(0xe7dfc6) } },
      side: THREE.DoubleSide,
      vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec3 vP;uniform float uX,uDirS,uGlow;uniform vec3 uCol;float w(vec2 p){return fract(sin(dot(floor(p),vec2(12.9,78.2)))*43758.5);}
        void main(){float d=(vP.x-uX)*uDirS;float e=smoothstep(.0,.05,-d+.01);vec3 c=mix(uCol*(.9+.03*w(vP.xy*260.)+.03*sin(vP.x*900.)*sin(vP.y*900.)),vec3(.05,.045,.04)+.05*w(vP.xy*160.),e);
        c+=vec3(1.,.42,.12)*uGlow*exp(-abs(d)*42.)*(.7+.3*w(vP.xy*40.));gl_FragColor=vec4(pow(c,vec3(.95)),1.);}`,
    });
    const metal = new THREE.MeshStandardMaterial({ color: 0x757b7c, roughness: 0.5, metalness: 0.5 });
    this.sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.406), this.sampleMat);
    const holder = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.52, 0.02), metal);
    holder.position.z = -0.014;
    this.sheet.add(holder);
    this.sheet.position.z = 0.03;
    const wg = new THREE.CylinderGeometry(0.012, 0.012, 1.2, 10);
    wg.rotateZ(Math.PI / 2);
    this.wire = new THREE.Mesh(wg, this.sampleMat);
    this.wire.position.z = 0.09;
    for (const x of [-0.45, 0.45]) {
      const clampM = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.07), metal);
      clampM.position.set(x, 0, -0.03);
      this.wire.add(clampM);
    }
    this.drop = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 18),
      new THREE.MeshStandardMaterial({ color: 0xcfe0f0, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.82 }),
    );
    this.drop.position.z = 0.5;
    const o = new THREE.Vector3(0, 0, 0.5);
    const ends = [new THREE.Vector3(-0.7, 0.5, 0.5), new THREE.Vector3(0.7, -0.5, 0.5), new THREE.Vector3(0.7, 0.5, 0.5), new THREE.Vector3(-0.7, -0.5, 0.5)];
    const pts: THREE.Vector3[] = [];
    ends.forEach((e) => pts.push(e, o));
    this.tethers = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x7c8388 }));
    this.fuel.add(this.sheet, this.wire, this.drop, this.tethers);

    this.flame = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), flameMaterial());
    this.flame.renderOrder = 2;
    this.flame.visible = false;
    this.light = new THREE.PointLight(0x6b9dff, 0, 4.5, 1.6);

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SMOKE_N * 3).fill(1e4), 3));
    g.setAttribute("aA", new THREE.BufferAttribute(new Float32Array(SMOKE_N), 1));
    this.smoke = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uH: { value: 800 }, uC: { value: new THREE.Color(0xa9a59f) } },
        vertexShader: `attribute float aA;varying float v;uniform float uH;void main(){v=aA;vec4 m=modelViewMatrix*vec4(position,1.);gl_PointSize=uH*.16/max(-m.z,.1);gl_Position=projectionMatrix*m;}`,
        fragmentShader: `varying float v;uniform vec3 uC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,0.,d);gl_FragColor=vec4(uC,a*a*v*.14);}`,
      }),
    );
    this.smoke.frustumCulled = false;
    this.smoke.renderOrder = 1;
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRACER_N * 3), 3));
    this.tracers = new THREE.Points(g2, new THREE.PointsMaterial({ color: 0xcfe7ff, size: 0.011, transparent: true, opacity: 0.45, depthWrite: false }));
    this.tracers.frustumCulled = false;
    this.root.add(this.fuel, this.flame, this.light, this.smoke, this.tracers);
  }

  /** Coloca el banco en un interior. */
  attach(spec: InteriorSpec): void {
    this.spec = spec;
    this.short.crossVectors(spec.normal, spec.axis).normalize();
    const basis = new THREE.Matrix4().makeBasis(spec.axis, this.short, spec.normal);
    this.fuel.quaternion.setFromRotationMatrix(basis);
    this.fuel.position.copy(spec.sample);
    this.fuel.updateMatrixWorld(true);
    const p = this.tracers.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < TRACER_N; i++) {
      p.setXYZ(
        i,
        spec.center.x + (Math.random() * 2 - 1) * spec.half.x,
        spec.center.y + (Math.random() * 2 - 1) * spec.half.y * 0.9,
        spec.center.z + (Math.random() * 2 - 1) * spec.half.z * 0.9,
      );
    }
    p.needsUpdate = true;
    this.clearSmoke();
  }

  /** Cambia la muestra de combustible. */
  setMaterial(m: Material): void {
    this.mat = m;
    const sheetLike = m.form === "sheet" || m.form === "slab";
    this.sheet.visible = sheetLike;
    this.wire.visible = m.form === "wire";
    this.drop.visible = this.tethers.visible = m.form === "droplet";
    if (sheetLike) this.sheet.scale.set(m.length / 94, m.width / 40.6, 1);
    (this.sampleMat.uniforms.uCol!.value as THREE.Color).set(m.color);
    this.clearSmoke();
  }

  setViewportHeight(px: number): void {
    (this.smoke.material as THREE.ShaderMaterial).uniforms.uH!.value = px;
  }

  clearSmoke(): void {
    this.smokeAge.fill(-1);
    const p = this.smoke.geometry.attributes.position as THREE.BufferAttribute;
    (p.array as Float32Array).fill(1e4);
    ((this.smoke.geometry.attributes.aA as THREE.BufferAttribute).array as Float32Array).fill(0);
    p.needsUpdate = true;
  }

  /** Actualiza muestra, llama, luz, humo y trazadores a partir del estado físico. */
  update(S: SimState, t: number, dt: number, steps: number, fogTarget: THREE.FogExp2 | null): void {
    const spec = this.spec;
    if (!spec) return;
    const m = this.mat;
    const c = S.cfg;
    const on = S.fire === "burning" || S.fire === "cool";
    // Flujo que ve la llama: ventilación + flotabilidad (cm/s)
    this.flow.copy(spec.ventDir).multiplyScalar(S.ventA + S.jet + 0.001).addScaledVector(spec.up, buoyFlow(c.g));
    const Um = this.flow.length();
    const dir = this.tmp.copy(this.flow).normalize();
    const along = this.flow.dot(spec.axis) >= 0 ? 1 : -1;
    const dirS = c.mode === "concurrent" ? along : -along;
    const L = m.length / 100;

    // Posición del frente en el sistema de la muestra
    let lx = 0, lz = 0.5;
    if (m.form !== "droplet") {
      lx = clamp(dirS * (S.x / 100 - L / 2), -L / 2, L / 2);
      lz = m.form === "wire" ? 0.12 : 0.1;
    }
    this.flamePos.set(lx, 0, lz);
    this.fuel.localToWorld(this.flamePos);

    const Mf = sat(S.M / 6);
    let R = m.form === "droplet" ? 0.05 + 0.014 * S.D : 0.042;
    R *= 0.72 + 0.33 * Mf + 0.1 * sat((S.O2l - 21) / 14);
    const stretch = 1 + Math.min(5.5, Um / (m.form === "droplet" ? 5 : 6.5));
    const hw = m.form === "sheet" || m.form === "slab" ? (m.width / 100 / 2) * 0.88 : 0;
    const bound = R * (stretch + 1.25) + hw + 0.05;
    const cool = S.fire === "cool";
    const u = (this.flame.material as THREE.ShaderMaterial).uniforms;
    (u.uDir!.value as THREE.Vector3).copy(dir);
    (u.uAxis!.value as THREE.Vector3).copy(this.short);
    u.uR!.value = R;
    u.uS!.value = stretch;
    u.uHW!.value = hw;
    u.uSoot!.value = cool ? 0 : S.soot;
    u.uI!.value = S.flame * (cool ? 0.5 : 0.45 + 0.75 * Mf);
    u.uT!.value = t;
    u.uFl!.value = 0.06 + 0.012 * Math.min(Um, 12) + 0.42 * sat(Math.cbrt(Math.max(c.g, 0)));
    u.uCool!.value = cool ? 1 : 0;
    u.uBound!.value = bound;
    u.uN!.value = steps;
    this.flame.visible = on && S.flame > 0.01;
    this.flame.scale.setScalar(bound);
    this.flame.position.copy(this.flamePos);

    this.light.color.setRGB(0.34 + 0.66 * S.soot, 0.42 + 0.28 * S.soot, 1 - 0.82 * S.soot);
    this.light.intensity = on ? S.flame * (0.45 + Math.min(3, S.Q * 2)) * (1 + 0.05 * Math.sin(t * 19)) : 0;
    this.light.position.copy(this.flamePos).addScaledVector(spec.normal, 0.16);

    const su = this.sampleMat.uniforms;
    su.uX!.value = m.form === "droplet" ? 0 : lx / (m.form === "wire" ? 1 : this.sheet.scale.x);
    su.uDirS!.value = dirS;
    su.uGlow!.value = on ? S.flame : S.Ts > tigNow(m, S.P) * 0.6 ? 0.45 * pyroX(m, S.Ts, S.P) : 0;
    if (m.form === "droplet") this.drop.scale.setScalar(Math.max(0.002, (S.D / 1000) * 5));
    if (fogTarget) fogTarget.density = 0.02 + sat(S.cab.smoke / 60) * 0.22;

    this.stepParticles(S, dt, Um);
  }

  private stepParticles(S: SimState, dt: number, Um: number): void {
    const spec = this.spec!;
    const pa = this.smoke.geometry.attributes.position as THREE.BufferAttribute;
    const aa = this.smoke.geometry.attributes.aA as THREE.BufferAttribute;
    const p = pa.array as Float32Array;
    const a = aa.array as Float32Array;
    const rate = S.Q * this.mat.smoke.yield * (0.6 + S.soot) + pyroX(this.mat, S.Ts, S.P) ** 2 * (S.fire === "none" || S.fire === "out" ? 2.2 : 0);
    if (dt > 0 && rate > 0.02) {
      const count = Math.min(6, Math.ceil(rate * 2.4 * dt * 14));
      for (let k = 0; k < count; k++) {
        const i = this.smokeI++ % SMOKE_N;
        p[i * 3] = this.flamePos.x + (Math.random() - 0.5) * 0.12;
        p[i * 3 + 1] = this.flamePos.y + (Math.random() - 0.5) * 0.12;
        p[i * 3 + 2] = this.flamePos.z + (Math.random() - 0.5) * 0.12;
        this.smokeAge[i] = 0;
      }
    }
    // El humo va con el aire: sin gravedad no sube; lo arrastra la ventilación.
    const vx = this.flow.x * 0.024, vy = this.flow.y * 0.024, vz = this.flow.z * 0.024;
    const lo = this.tmp.copy(spec.center).sub(spec.half), hx = spec.center.x + spec.half.x, hy = spec.center.y + spec.half.y, hz = spec.center.z + spec.half.z;
    const lox = lo.x, loy = lo.y, loz = lo.z;
    for (let i = 0; i < SMOKE_N; i++) {
      const age0 = this.smokeAge[i]!;
      if (age0 < 0) continue;
      const age = age0 + dt;
      this.smokeAge[i] = age;
      if (age > 45) {
        this.smokeAge[i] = -1;
        a[i] = 0;
        p[i * 3] = 1e4;
        continue;
      }
      const j = 0.09 * dt;
      p[i * 3] = clamp(p[i * 3]! + vx * dt + (Math.random() - 0.5) * j, lox + 0.06, hx - 0.06);
      p[i * 3 + 1] = clamp(p[i * 3 + 1]! + vy * dt + (Math.random() - 0.5) * j, loy + 0.06, hy - 0.06);
      p[i * 3 + 2] = clamp(p[i * 3 + 2]! + vz * dt + (Math.random() - 0.5) * j + 0.02 * dt, loz + 0.06, hz - 0.06);
      a[i] = Math.min(age * 2, 1) * Math.max(0, 1 - age / 45);
    }
    pa.needsUpdate = true;
    aa.needsUpdate = true;

    this.tracers.visible = this.showTracers;
    if (this.showTracers && dt > 0) {
      const tp = this.tracers.geometry.attributes.position as THREE.BufferAttribute;
      const tv = tp.array as Float32Array;
      const k = 0.0045 * dt * (Um > 0.5 ? 1 : 0.2);
      for (let i = 0; i < TRACER_N; i++) {
        let x = tv[i * 3]! + this.flow.x * k, y = tv[i * 3 + 1]! + this.flow.y * k + (Math.random() - 0.5) * 0.0012, z = tv[i * 3 + 2]! + this.flow.z * k;
        if (x > hx) x = lox; else if (x < lox) x = hx;
        if (y > hy) y = loy; else if (y < loy) y = hy;
        if (z > hz) z = loz; else if (z < loz) z = hz;
        tv[i * 3] = x;
        tv[i * 3 + 1] = y;
        tv[i * 3 + 2] = z;
      }
      tp.needsUpdate = true;
    }
  }
}
