// src/lib/grain-maps.js — superfície procedural para materiais 3D.
// Gera mapas normal + roughness a partir de um campo de altura fractal
// (ruído de valor multi-oitava → normais por Sobel). Zero assets externos.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';

const S = 256;
const OCT = [{ f: 24, a: 0.5 }, { f: 48, a: 0.28 }, { f: 96, a: 0.16 }, { f: 192, a: 0.09 }];

let cached = null;

/** @returns {{normal: THREE.CanvasTexture, rough: THREE.CanvasTexture}} */
export function grainMaps() {
  if (cached) return cached;

  const grids = OCT.map((o) => Float32Array.from({ length: o.f * o.f }, () => Math.random()));
  const sample = (g, f, x, y) => {
    const fx = x * f, fy = y * f, x0 = ((fx | 0) % f + f) % f, y0 = ((fy | 0) % f + f) % f;
    const x1 = (x0 + 1) % f, y1 = (y0 + 1) % f, tx = fx - Math.floor(fx), ty = fy - Math.floor(fy);
    const a = g[y0 * f + x0], b = g[y0 * f + x1], c = g[y1 * f + x0], e = g[y1 * f + x1];
    return (a + (b - a) * tx) * (1 - ty) + (c + (e - c) * tx) * ty;
  };

  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let v = 0, amp = 0;
    for (let i = 0; i < OCT.length; i++) { v += sample(grids[i], OCT[i].f, x / S, y / S) * OCT[i].a; amp += OCT[i].a; }
    h[y * S + x] = Math.max(0, Math.min(1, (v / amp - 0.5) * 1.7 + 0.5));
  }
  const at = (x, y) => h[(((y % S) + S) % S) * S + (((x % S) + S) % S)];

  const mk = (fill) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) fill(img.data, (y * S + x) * 4, x, y);
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.05, 0.05); t.anisotropy = 8;
    return t;
  };

  cached = {
    normal: mk((d, i, x, y) => {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.6, dy = (at(x, y + 1) - at(x, y - 1)) * 2.6;
      const len = Math.hypot(-dx, -dy, 1);
      d[i] = (-dx / len * 0.5 + 0.5) * 255;
      d[i + 1] = (-dy / len * 0.5 + 0.5) * 255;
      d[i + 2] = (1 / len * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }),
    rough: mk((d, i, x, y) => {
      const v = (0.4 + at(x, y) * 0.42) * 255 | 0;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }),
  };
  return cached;
}
