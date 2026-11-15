/**
 * Efectos de realismo pensados para el navegador.
 *
 * - Resplandor de la llama: solo la llama se dibuja en una textura a un cuarto
 *   de resolución, se difumina y se suma sobre la imagen. No hay posprocesado
 *   de pantalla completa: la escena se sigue dibujando directo, con su
 *   antialiasing, y el coste añadido es mínimo.
 * - Entorno de reflexión generado por código, para dar brillo a los metales.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const QUAD_VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
// Desenfoque gaussiano separable de 9 muestras.
const BLUR_FS = `precision mediump float;varying vec2 vUv;uniform sampler2D uMap;uniform vec2 uStep;
void main(){vec4 c=texture2D(uMap,vUv)*.227;
c+=(texture2D(uMap,vUv+uStep*1.385)+texture2D(uMap,vUv-uStep*1.385))*.316;
c+=(texture2D(uMap,vUv+uStep*3.231)+texture2D(uMap,vUv-uStep*3.231))*.07;gl_FragColor=c;}`;
const ADD_FS = `precision mediump float;varying vec2 vUv;uniform sampler2D uMap;uniform float uK;
void main(){vec3 c=texture2D(uMap,vUv).rgb;gl_FragColor=vec4(c*uK,1.);}`;

/** Resplandor selectivo de la llama. */
export class FlameGlow {
  private readonly a = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false });
  private readonly b = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false });
  private readonly quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh;
  private readonly blur: THREE.ShaderMaterial;
  private readonly add: THREE.ShaderMaterial;

  constructor() {
    this.blur = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: null }, uStep: { value: new THREE.Vector2() } },
      vertexShader: QUAD_VS,
      fragmentShader: BLUR_FS,
      depthTest: false,
      depthWrite: false,
    });
    this.add = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: null }, uK: { value: 1 } },
      vertexShader: QUAD_VS,
      fragmentShader: ADD_FS,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blur);
    this.quad.frustumCulled = false;
  }

  /** Tamaño del lienzo en píxeles reales; el resplandor trabaja a un cuarto. */
  setSize(width: number, height: number): void {
    const w = Math.max(2, Math.round(width / 4)), h = Math.max(2, Math.round(height / 4));
    this.a.setSize(w, h);
    this.b.setSize(w, h);
  }

  /**
   * Suma el resplandor de la llama sobre la imagen ya dibujada.
   * @param flame Malla de la llama (con sus matrices ya actualizadas).
   * @param strength Intensidad del resplandor (0–1).
   */
  render(renderer: THREE.WebGLRenderer, flame: THREE.Object3D, camera: THREE.Camera, strength: number): void {
    const autoClear = renderer.autoClear;
    // 1. Solo la llama, sobre negro
    renderer.setRenderTarget(this.a);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.autoClear = false;
    renderer.render(flame, camera);
    // 2. Dos vueltas de desenfoque (la segunda, más ancha)
    this.quad.material = this.blur;
    const step = this.blur.uniforms.uStep!.value as THREE.Vector2;
    let src = this.a, dst = this.b;
    for (const [dx, dy] of [[1, 0], [0, 1], [2.4, 0], [0, 2.4]] as const) {
      this.blur.uniforms.uMap!.value = src.texture;
      step.set(dx / src.width, dy / src.height);
      renderer.setRenderTarget(dst);
      renderer.render(this.quad, this.quadCam);
      [src, dst] = [dst, src];
    }
    // 3. Suma sobre la pantalla
    this.add.uniforms.uMap!.value = src.texture;
    this.add.uniforms.uK!.value = strength;
    this.quad.material = this.add;
    renderer.setRenderTarget(null);
    renderer.render(this.quad, this.quadCam);
    renderer.autoClear = autoClear;
  }

  dispose(): void {
    this.a.dispose();
    this.b.dispose();
    this.blur.dispose();
    this.add.dispose();
    this.quad.geometry.dispose();
  }
}

/**
 * Entorno de reflexión genérico (una sala con luces suaves, generada por
 * código): da brillo a aros, visores y piezas metálicas sin descargar nada.
 */
export function buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  return env;
}
