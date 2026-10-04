// A live bathymetric chart: a scalar "seabed" field sampled on a grid and
// traced into iso-lines with marching squares. Cheap enough to run every frame.

// ---- 3D gradient noise (improved Perlin) ----

const perm = new Uint8Array(512);
{
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = 1013;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;
function grad(h, x, y, z) {
  const u = (h & 15) < 8 ? x : y;
  const v = (h & 15) < 4 ? y : (h & 15) === 12 || (h & 15) === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function noise3(x, y, z) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  const A = perm[X] + Y;
  const AA = perm[A] + Z;
  const AB = perm[A + 1] + Z;
  const B = perm[X + 1] + Y;
  const BA = perm[B] + Z;
  const BB = perm[B + 1] + Z;
  return lerp(
    lerp(
      lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
      lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u),
      v
    ),
    lerp(
      lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
      lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u),
      v
    ),
    w
  );
}

// ---- Marching squares ----

// For each of the 16 corner cases, the pairs of cell edges a line crosses.
// Edges: 0 top, 1 right, 2 bottom, 3 left. Corners: a tl, b tr, c br, d bl.
const CASES = [
  [], [3, 2], [2, 1], [3, 1], [0, 1], [3, 0, 2, 1], [0, 2], [3, 0],
  [0, 3], [0, 2], [0, 1, 3, 2], [0, 1], [3, 1], [1, 2], [3, 2], [],
];

/**
 * Trace iso-lines of `field` (cols+1 × rows+1 samples, row-major) into two
 * Path2D objects: regular lines and every `accentEvery`-th "index" line.
 */
export function traceContours(field, cols, rows, cell, levels) {
  const { min, step, count, accentEvery } = levels;
  const thin = new Path2D();
  const bold = new Path2D();
  const stride = cols + 1;

  for (let j = 0; j < rows; j++) {
    const y0 = j * cell;
    for (let i = 0; i < cols; i++) {
      const x0 = i * cell;
      const a = field[j * stride + i];
      const b = field[j * stride + i + 1];
      const c = field[(j + 1) * stride + i + 1];
      const d = field[(j + 1) * stride + i];

      // Only visit the levels this cell actually spans.
      const lo = Math.min(a, b, c, d);
      const hi = Math.max(a, b, c, d);
      let k0 = Math.ceil((lo - min) / step);
      let k1 = Math.floor((hi - min) / step);
      if (k0 < 0) k0 = 0;
      if (k1 >= count) k1 = count - 1;

      for (let k = k0; k <= k1; k++) {
        const L = min + k * step;
        const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
        const edges = CASES[idx];
        if (!edges.length) continue;
        const path = k % accentEvery === 0 ? bold : thin;

        for (let e = 0; e < edges.length; e += 2) {
          const p = edgePoint(edges[e], x0, y0, cell, a, b, c, d, L);
          const q = edgePoint(edges[e + 1], x0, y0, cell, a, b, c, d, L);
          path.moveTo(p[0], p[1]);
          path.lineTo(q[0], q[1]);
        }
      }
    }
  }
  return { thin, bold };
}

const pt = [0, 0];
const pt2 = [0, 0];
let flip = false;
function edgePoint(edge, x0, y0, s, a, b, c, d, L) {
  // Alternate between two scratch arrays so p and q never alias.
  const out = (flip = !flip) ? pt : pt2;
  switch (edge) {
    case 0:
      out[0] = x0 + s * ((L - a) / (b - a));
      out[1] = y0;
      break;
    case 1:
      out[0] = x0 + s;
      out[1] = y0 + s * ((L - b) / (c - b));
      break;
    case 2:
      out[0] = x0 + s * ((L - d) / (c - d));
      out[1] = y0 + s;
      break;
    default:
      out[0] = x0;
      out[1] = y0 + s * ((L - a) / (d - a));
  }
  return out;
}
