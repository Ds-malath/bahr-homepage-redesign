import { useRef } from "react";
import { gsap, SplitText, scrollToId, useGSAP } from "../lib/gsap";
import { revealItems } from "../lib/reveal";
import { useLang } from "../i18n";
import Magnetic from "../components/Magnetic";

// Abstract "code" for the system layer: [indent, width%, accent?]
const CODE = [
  [0, 46], [1, 62, 1], [2, 38], [2, 54], [1, 30], [0, 22, 1], [0, 58], [1, 44], [2, 66, 1], [2, 34], [1, 50], [0, 26],
];

function Layers({ t }) {
  return (
    <figure className="layers" data-reveal>
      <div className="layers-stage">
        <div className="layers-stack">
          <div className="layer layer--system">
            {CODE.map(([indent, w, accent], i) => (
              <i key={i} style={{ marginInlineStart: `${indent * 8}%`, width: `${w}%` }} className={accent ? "is-accent" : ""} />
            ))}
          </div>
          <div className="layer layer--structure">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="6" y="5" width="88" height="6" />
              <rect x="6" y="22" width="52" height="16" />
              <rect x="6" y="44" width="40" height="4" />
              <rect x="6" y="54" width="14" height="5" />
              <rect x="23" y="54" width="14" height="5" />
              <rect x="66" y="15" width="28" height="58" />
              <rect x="6" y="80" width="27" height="15" />
              <rect x="37" y="80" width="27" height="15" />
              <rect x="67" y="80" width="27" height="15" />
              <line x1="66" y1="15" x2="94" y2="73" />
              <line x1="94" y1="15" x2="66" y2="73" />
            </svg>
          </div>
          <div className="layer layer--surface">
            <img src="/projects/alageely.jpg" alt="" loading="lazy" width="1440" height="1440" />
          </div>
        </div>
      </div>
      <figcaption>
        <span className="eyebrow muted">{t.about.layersCaption}</span>
        <ol>
          {t.about.layers.map((l, i) => (
            <li key={l.k}>
              <span className="mono accent">0{i + 1}</span>
              <b>{l.k}</b>
              <span className="muted">{l.v}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

export default function Agency() {
  const root = useRef(null);
  const { t } = useLang();

  useGSAP(
    () => {
      revealItems(root.current);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The statement surfaces word by word as it scrolls through.
        const split = SplitText.create(".statement", { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: ".statement", start: "top 80%", end: "bottom 50%", scrub: true },
          }
        );

        // Exploded view: the three layers of a product pull apart in depth.
        const st = { trigger: ".layers", start: "top 85%", end: "bottom 35%", scrub: 0.8 };
        gsap.fromTo(".layer--surface", { z: 0 }, { z: 130, ease: "none", scrollTrigger: st });
        gsap.fromTo(".layer--system", { z: 0 }, { z: -130, ease: "none", scrollTrigger: st });
        gsap.fromTo(".layers-stack", { rotateX: 0, rotateZ: 0 }, { rotateX: 56, rotateZ: -36, ease: "none", scrollTrigger: st });
      });

      // Pointer tilt for the stack on desktop.
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const stage = root.current.querySelector(".layers-stage");
        const rx = gsap.quickTo(stage, "rotateX", { duration: 0.8, ease: "power3.out" });
        const ry = gsap.quickTo(stage, "rotateY", { duration: 0.8, ease: "power3.out" });
        const move = (e) => {
          const r = stage.getBoundingClientRect();
          rx(((e.clientY - r.top) / r.height - 0.5) * -10);
          ry(((e.clientX - r.left) / r.width - 0.5) * 12);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", leave);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: root }
  );

  return (
    <section id="about" className="section agency" ref={root}>
      <div className="section-head">
        <span className="eyebrow">{t.about.eyebrow}</span>
        <span className="eyebrow muted">{t.about.aside}</span>
      </div>

      <h2 className="statement display">{t.about.statement}</h2>

      <div className="agency-grid">
        <Layers t={t} />
        <div className="agency-copy">
          <p className="agency-who" data-reveal>
            <b>{t.about.who}</b> {t.about.whoLine}
          </p>
          {t.about.body.map((p) => (
            <p key={p.slice(0, 12)} data-reveal className="muted">
              {p}
            </p>
          ))}
          <div data-reveal>
            <Magnetic>
              <button className="btn" onClick={() => scrollToId("services")}>
                {t.about.cta} <span aria-hidden="true">↗</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
