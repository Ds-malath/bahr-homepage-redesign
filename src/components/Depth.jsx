import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { DEPTHS } from "../data";
import { useLang } from "../i18n";

// Keys that would pass through a low-contrast grey if interpolated across
// the light → dark flip, so they switch at the midpoint instead.
const STEPPED = ["ink", "muted", "line", "contour"];

const snap = (p) => {
  const x = Math.min(1, Math.max(0, (p - 0.38) / 0.24));
  return x * x * (3 - 2 * x);
};

const apply = (palette) => {
  const root = document.documentElement.style;
  for (const k in palette) root.setProperty(`--${k}`, palette[k]);
};

/**
 * The page is a water column: as each section arrives, the site palette is
 * interpolated toward that section's depth. Also renders the depth gauge.
 * Mount after the sections so pinned spacers exist when triggers measure.
 */
export default function Depth() {
  const { t } = useLang();
  const root = useRef(null);
  const num = useRef(null);
  const [zone, setZone] = useState(0);

  useGSAP(() => {
    const progress = DEPTHS.map(() => 0);
    const setMarker = gsap.quickSetter(root.current.querySelector(".gauge-marker"), "yPercent");
    let current = -1;

    const update = () => {
      let i = 0;
      for (let j = 1; j < DEPTHS.length; j++) if (progress[j] > 0) i = j;
      const from = DEPTHS[Math.max(0, i - 1)];
      const to = DEPTHS[i];
      const p = i === 0 ? 1 : progress[i];

      // Across the light/dark flip, rush the background through its mid-tones
      // so text never sits on a low-contrast grey for long.
      const flip = from.dark !== to.dark;
      const mixed = gsap.utils.interpolate(from.palette, to.palette, flip ? snap(p) : p);
      if (flip) {
        const side = p < 0.5 ? from.palette : to.palette;
        STEPPED.forEach((k) => (mixed[k] = side[k]));
      }
      apply(mixed);
      // Lets the Bahr mark swap to its official dark-theme gradient.
      document.documentElement.dataset.depth = (p < 0.5 ? from : to).dark ? "dark" : "light";

      const metres = from.metres + (to.metres - from.metres) * p;
      num.current.textContent = String(Math.round(metres)).padStart(4, "0");
      setMarker((metres / DEPTHS.at(-1).metres) * 100);

      const z = p > 0.5 ? i : Math.max(0, i - 1);
      if (z !== current) {
        current = z;
        setZone(z);
      }
    };

    DEPTHS.forEach((d, j) => {
      if (j === 0) return;
      const el = document.getElementById(d.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        end: "top 25%",
        onUpdate: (self) => {
          progress[j] = self.progress;
          update();
        },
        onRefresh: (self) => {
          progress[j] = self.progress;
          update();
        },
      });
    });
    update();
  });

  const zoneLabel = t.nav[DEPTHS[zone].id];

  return (
    <aside className="gauge" ref={root} aria-hidden="true">
      <div className="gauge-read">
        <span>{t.gauge.depth}</span>
        <b>
          <span ref={num}>0000</span> {t.gauge.unit}
        </b>
      </div>
      <div className="gauge-track">
        <div className="gauge-marker">
          <i />
        </div>
      </div>
      <div className="gauge-zone">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={zoneLabel}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {zoneLabel}
          </motion.span>
        </AnimatePresence>
      </div>
    </aside>
  );
}
