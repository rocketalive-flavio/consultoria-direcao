// src/lib/compass3d.js — efeito assinatura da Direção: o símbolo da Norte (arco +
// agulha) extrudado em 3D. Ao carregar, a peça oscila e amortece como uma bússola
// procurando o norte; depois responde ao mouse. Roda no ticker do GSAP — nunca um
// segundo RAF loop (regra de ouro do método).
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import { SVGLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/SVGLoader.js/+esm';
import { gsap } from './gsap.js';
import { grainMaps } from './grain-maps.js';
import { reduced } from '../utils/dom.js';

const SVG_URL = 'assets/simbolo.svg';

/**
 * Monta a bússola 3D dentro de `container` (dimensionado pelo CSS).
 * @returns {{ resize():void, dispose():void } | null} null se WebGL indisponível.
 */
export function initCompass3D(container) {
  if (!container || typeof window === 'undefined' || !window.WebGLRenderingContext) return null;

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
  catch { return null; }                       // WebGL bloqueado → hero segue sem a peça
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Ambiente: softboxes neutros (sem tint) — a paleta é preto e creme, sem cor.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x0a0a0a);
  const pg = new THREE.PlaneGeometry(1, 1);
  const soft = (x, y, z, sx, sy, i) => {
    const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: new THREE.Color(i, i, i) }));
    m.position.set(x, y, z); m.scale.set(sx, sy, 1); m.lookAt(0, 0, 0); envScene.add(m);
  };
  soft(0.4, 2.6, 2.4, 5.5, 2.6, 7.5);
  soft(0, 0.2, 4.8, 6, 6, 3.6);
  soft(-2.8, 0.2, 1.6, 1.8, 4.6, 3.4);
  soft(2.9, -0.4, 1.4, 1.5, 3.6, 2.6);
  const envTex = pmrem.fromScene(envScene, 0.012).texture;
  scene.environment = envTex;

  // Object3D.position é somente-leitura — sempre .position.set(), nunca atribuição.
  const dir = (hex, intensity, x, y, z) => {
    const l = new THREE.DirectionalLight(hex, intensity);
    l.position.set(x, y, z);
    scene.add(l);
  };
  dir(0xffffff, 1.6, 2.6, 3.4, 3.6);    // key
  dir(0xf8f6f3, 1.25, -3, 1.8, -4);     // rim
  dir(0xffffff, 0.95, -4, 0.6, 1.2);    // rasante — revela o relevo do grão
  scene.add(new THREE.AmbientLight(0xffffff, 0.16));

  const model = new THREE.Group();
  scene.add(model);
  let mesh = null, sizeX = 1, sizeY = 1;

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xF8F6F3), metalness: 0.72, roughness: 0.3,
    clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 1.6, side: THREE.DoubleSide,
  });
  const gm = grainMaps();
  material.normalMap = gm.normal;
  material.normalScale = new THREE.Vector2(0.9, 0.9);
  material.roughnessMap = gm.rough;

  // Escala pela CAIXA real da peça (largura × altura), não pela bounding sphere:
  // o símbolo é largo e baixo (viewBox 175×107), então sua esfera é bem maior que
  // ele — medir por ela deixava margem morta e, em palco não-quadrado, fazia a
  // peça transbordar na horizontal. Com a caixa, FILL é literal: fração do palco.
  // 0.78 deixa margem para a rotação em Y, que desloca a silhueta em perspectiva.
  const FILL = 0.92;

  function fit() {
    if (!mesh) return;
    const fitH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
    const fitW = fitH * camera.aspect;
    mesh.scale.setScalar(Math.min((fitW * FILL) / sizeX, (fitH * FILL) / sizeY));
  }
  function render() { renderer.render(scene, camera); }
  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    fit(); render();
  }

  fetch(SVG_URL).then((r) => r.text()).then((text) => {
    const built = new THREE.Group();
    for (const path of new SVGLoader().parse(text).paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        built.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
          depth: 15, bevelEnabled: true, bevelThickness: 2.4, bevelSize: 1.8, bevelSegments: 3, curveSegments: 18,
        }), material));
      }
    }
    built.scale.y = -1;                                   // espaço SVG é Y-down
    const box = new THREE.Box3().setFromObject(built);
    const size = box.getSize(new THREE.Vector3());
    built.position.sub(box.getCenter(new THREE.Vector3()));   // gira em torno do centro real
    const holder = new THREE.Group(); holder.add(built);
    mesh = holder; sizeX = size.x || 1; sizeY = size.y || 1;
    model.add(holder);
    fit(); container.dataset.ready = '1'; render();
  }).catch((err) => console.error('[compass3d] falha ao montar o símbolo:', err));

  // ── Movimento: oscilação amortecida de bússola → repouso no norte, e tilt de mouse.
  let px = 0, py = 0, t0 = null, ticking = false;
  const onPointer = (e) => { px = (e.clientX / innerWidth) * 2 - 1; py = (e.clientY / innerHeight) * 2 - 1; };

  function tick(time) {
    if (t0 === null) t0 = time;
    const t = time - t0;
    // Agulha procurando o norte: senoide com envelope exponencial que zera em ~6s.
    const settle = Math.cos(t * 3.1) * 0.85 * Math.exp(-t * 0.62);
    const ty = 0.16 + px * 0.42 + Math.sin(t * 0.3) * 0.2 + settle;
    const tx = 0.08 - py * 0.26 + Math.sin(t * 0.55) * 0.05;
    model.rotation.y += (ty - model.rotation.y) * 0.06;
    model.rotation.x += (tx - model.rotation.x) * 0.06;
    model.position.y = Math.sin(t * 0.8) * 0.07;
    render();
  }

  // Pausa fora do viewport: nenhum frame gasto com o hero fora da tela.
  const setActive = (on) => {
    if (on === ticking) return;
    ticking = on;
    if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
  };

  if (window.ResizeObserver) new ResizeObserver(resize).observe(container);
  resize();

  let io = null;
  if (reduced) {
    model.rotation.set(0.06, -0.14, 0);                   // ângulo estático, sem movimento
    render();
  } else {
    addEventListener('pointermove', onPointer, { passive: true });
    io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(container);
    setActive(true);
  }

  function dispose() {
    setActive(false);
    io?.disconnect();
    removeEventListener('pointermove', onPointer);
    model.traverse((o) => o.isMesh && o.geometry?.dispose());
    material.dispose(); envTex.dispose(); pmrem.dispose(); renderer.dispose();
    renderer.domElement.remove();
  }

  return { resize, dispose };
}
