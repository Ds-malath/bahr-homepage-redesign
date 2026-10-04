import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { revealItems } from "../lib/reveal";
import { useLang } from "../i18n";

// Where each discipline starts: scattered across the frame at different
// depths. Scroll pulls them into one line.
const SCATTER = [
  { xPercent: -40, y: "-26vh", scale: 1.5, rotate: -4 },
  { xPercent: 30, y: "-14vh", scale: 0.55, rotate: 3 },
  { xPercent: -25, y: "20vh", scale: 0.7, rotate: 2 },
  { xPercent: 60, y: "26vh", scale: 1.8, rotate: -3 },
];

export default function Difference() {
  const root = useRef(null);
  const { t } = useLang();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const words = gsap.utils.toArray(".diff-word", root.current);
        const tl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          scrollTrigger: { trigger: ".diff-pin", start: "top top", end: "+=140%", pin: true, scrub: 0.8 },
        });

        words.forEach((w, i) => {
          const s = SCATTER[i];
          tl.fromTo(
            w,
            { ...s, opacity: 0.45, filter: `blur(${Math.abs(1 - s.scale) * 8}px)` },
            { xPercent: 0, y: 0, scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)", duration: 1 },
            0
          );
        });
        tl.from(".diff-plus", { opacity: 0, scale: 0, stagger: 0.05, duration: 0.3 }, 0.75)
          .from(".diff-desc", { opacity: 0, y: 20, stagger: 0.06, duration: 0.35 }, 0.9)
          .from(".diff-result", { opacity: 0, yPercent: 60, duration: 0.4 }, 1.1)
          .to({}, { duration: 0.25 });
      });

      mm.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => revealItems(root.current));
    },
    { scope: root }
  );

  return (
    <section id="difference" className="difference" ref={root}>
      <div className="diff-pin">
        <div className="section-head diff-head">
          <span className="eyebrow">{t.difference.eyebrow}</span>
          <span className="eyebrow muted">{t.difference.aside}</span>
        </div>

        <ul className="diff-row">
          {t.difference.words.map((w, i) => (
            <li key={w.k} className="diff-item" data-reveal>
              {i > 0 && (
                <span className="diff-plus" aria-hidden="true">
                  +
                </span>
              )}
              <span className="diff-word display">{w.k}</span>
              <span className="diff-desc">{w.v}</span>
            </li>
          ))}
        </ul>

        <p className="diff-result display" data-reveal>
          <span aria-hidden="true">= </span>
          <em>{t.difference.result}</em>
        </p>
      </div>
    </section>
  );
}
