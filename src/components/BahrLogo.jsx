import { useId } from "react";
// Bahr's official mark, byte-for-byte from bybahr.com/assets/favicon.svg.
// Path data and gradient stops are read from that file, never retyped.
import officialSvg from "../assets/bahr-logo.svg?raw";

const PATHS = [...officialSvg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);

const stopsOf = (gradientId) => {
  const block = officialSvg.match(new RegExp(`<linearGradient id="${gradientId}"[\\s\\S]*?</linearGradient>`))[0];
  return [...block.matchAll(/offset="([^"]+)" stop-color="([^"]+)"/g)].map((m) => ({ offset: m[1], color: m[2] }));
};
const GRADIENTS = { light: stopsOf("light"), dark: stopsOf("dark") };

// Tight bounds of the mark, as used by the live site's header logo.
const VIEWBOX = "93.298654 3.955098 53.004055 46.444903";

/**
 * Inline so it can follow the page's depth: Bahr's own navy gradient on the
 * light surface, its own pastel gradient once the page turns dark.
 * Pass `label` when the mark stands alone; omit it inside a labelled link.
 */
export default function BahrLogo({ className = "", label }) {
  const id = useId().replace(/:/g, "");
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true, focusable: "false" };

  return (
    <svg className={`bahr-logo ${className}`} viewBox={VIEWBOX} xmlns="http://www.w3.org/2000/svg" {...a11y}>
      {label && <title>{label}</title>}
      <defs>
        {Object.entries(GRADIENTS).map(([name, stops]) => (
          <linearGradient key={name} id={`${id}-${name}`} gradientUnits="userSpaceOnUse" x1="140" y1="4" x2="98" y2="50">
            {stops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        ))}
      </defs>
      {Object.keys(GRADIENTS).map((name) => (
        <g key={name} className={`bahr-logo-${name}`} fill={`url(#${id}-${name})`}>
          {PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      ))}
    </svg>
  );
}
