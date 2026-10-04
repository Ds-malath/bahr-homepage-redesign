import { useEffect, useRef } from "react";
import { noise3, traceContours } from "../lib/contours";
import { prefersReducedMotion } from "../lib/gsap";

const LEVELS = { min: -3.2, step: 0.08, count: 80, accentEvery: 5 };

// Seabed shapes. Coordinates are in viewport-height units (x is aspect-scaled)
// so features stay round at any size. `p` is the eased pointer.
const FIELDS = {
  // Open water: drifting relief, a basin under the anchor (the Bahr mark),
  // and a dip that follows the cursor so the contours ring around it.
  chart(x, y, t, w, p, b) {
    const bx = x - b.x;
    const by = y - b.y;
    const px = x - p.x;
    const py = y - p.y;
    return (
      0.95 * noise3(x * 1.25, y * 1.25, t) +
      0.32 * noise3(x * 3.1, y * 3.1, t * 1.4 + 7) -
      1.25 * Math.exp(-(bx * bx + by * by) / 0.16) -
      p.amp * 1.1 * Math.exp(-(px * px + py * py) / 0.028)
    );
  },
  // The trench: everything converges on one deep point, nudged by the cursor.
  trench(x, y, t, w, p) {
    const cx = x - (w * 0.5 + (p.x - w * 0.5) * 0.18);
    const cy = y - (0.52 + (p.y - 0.52) * 0.18);
    const d = cx * cx + cy * cy;
    return (
      -2.3 * Math.exp(-d / 0.07) -
      0.7 * Math.exp(-d / 0.5) +
      0.34 * noise3(x * 1.5, y * 1.5, t) +
      0.12 * noise3(x * 4, y * 4, t * 1.3 + 3)
    );
  },
};

export default function ContourField({ variant = "chart", className = "", anchor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const fieldFn = FIELDS[variant];
    const still = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let W = 0;
    let H = 0;
    let cell = 12;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);
    let colors = { line: "#888", accent: "#24559b" };
    let frame = 0;
    let raf = 0;
    let running = false;
    let t = Math.random() * 10;
    let last = performance.now();
    let lastPointer = -Infinity;

    // Pointer target and its eased follower, both in field units.
    const target = { x: 0, y: 0, amp: 0 };
    const p = { x: 0, y: 0, amp: 0 };
    // Basin centre, in field units. Follows `anchor` when given.
    const basin = { x: 0, y: 0.58 };

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      colors = { line: cs.getPropertyValue("--contour").trim(), accent: cs.getPropertyValue("--accent").trim() };
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      cell = W < 700 ? 15 : 12;
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);
      field = new Float32Array((cols + 1) * (rows + 1));
      basin.x = (W / H) * 0.74;
      basin.y = 0.58;
      const a = anchor && canvas.parentElement?.querySelector(anchor);
      if (a) {
        // Measured from layout, so transforms from the intro don't skew it.
        const ar = a.getBoundingClientRect();
        basin.x = (ar.left - r.left + ar.width / 2) / H;
        basin.y = (ar.top - r.top + ar.height / 2) / H;
      }
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      if (!p.x) {
        p.x = target.x = (W / H) * 0.35;
        p.y = target.y = 0.45;
      }
      readColors();
      draw();
    };

    const draw = () => {
      const aspect = W / H;
      const stride = cols + 1;
      for (let j = 0; j <= rows; j++) {
        const y = (j * cell) / H;
        for (let i = 0; i <= cols; i++) {
          field[j * stride + i] = fieldFn((i * cell) / H, y, t, aspect, p, basin);
        }
      }
      const { thin, bold } = traceContours(field, cols, rows, cell, LEVELS);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = "round";
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.stroke(thin);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.85;
      ctx.stroke(bold);
      ctx.globalAlpha = 1;
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt * 0.07;

      // With no pointer for a while (or on touch), let the dip wander.
      if (now - lastPointer > 2500) {
        const s = now / 1000;
        const aspect = W / H;
        target.x = aspect * (0.5 + 0.3 * Math.sin(s * 0.21));
        target.y = 0.5 + 0.22 * Math.sin(s * 0.33 + 1);
        target.amp = 0.75;
      }
      p.x += (target.x - p.x) * 0.06;
      p.y += (target.y - p.y) * 0.06;
      p.amp += (target.amp - p.amp) * 0.05;

      if (++frame % 12 === 0) readColors();
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || still) return;
      running = true;
      readColors();
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointer = (e) => {
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      target.x = (e.clientX - r.left) / r.height;
      target.y = (e.clientY - r.top) / r.height;
      target.amp = 1;
      lastPointer = performance.now();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [variant, anchor]);

  return <canvas ref={canvasRef} className={`contours ${className}`} aria-hidden="true" />;
}
