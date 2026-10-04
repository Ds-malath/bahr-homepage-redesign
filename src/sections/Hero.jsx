import { useRef } from "react";
import { gsap, SplitText, scrollToId, useGSAP } from "../lib/gsap";
import { useLang } from "../i18n";
import ContourField from "../components/ContourField";
import Magnetic from "../components/Magnetic";
import BahrLogo from "../components/BahrLogo";

// Each title line sits at a different depth: it parallaxes with the pointer
// by `depth`, and rushes past the camera at a different rate on scroll.
const LINE_DEPTH = [1, 0.55, 0.3];

export default function Hero() {
  const root = useRef(null);
  const { t, lang } = useLang();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          fine: "(pointer: fine)",
          wide: "(min-width: 900px)",
        },
        (ctx) => {
          if (!ctx.conditions.motion) return;
          const lines = gsap.utils.toArray(".hero-line");

          // Intro. Arabic letters must stay joined, so split by words there.
          const split = SplitText.create(".hero-line-inner", {
            type: lang === "ar" ? "words" : "chars",
            mask: lang === "ar" ? "words" : "chars",
          });
          const pieces = lang === "ar" ? split.words : split.chars;
          gsap
            .timeline({ delay: 0.15 })
            .from(".contours--hero", { opacity: 0, scale: 1.08, duration: 2.4, ease: "power2.out" }, 0)
            // The mark surfaces from below, coming into focus.
            .from(
              ".hero-logo .bahr-logo",
              { yPercent: 35, opacity: 0, scale: 0.86, filter: "blur(14px)", duration: 1.8 },
              0.05
            )
            .from(pieces, { yPercent: 115, stagger: 0.03, duration: 1.3 }, 0.1)
            .from(".hero-note", { opacity: 0, x: -20, duration: 1 }, 0.8)
            .from(".hero-foot > *", { opacity: 0, y: 24, stagger: 0.08, duration: 1 }, 0.7);

          // Descent: let each layer pass the camera at its own speed. Pinned on
          // larger screens; on phones it plays as the hero scrolls away.
          const wide = ctx.conditions.wide;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: wide ? "+=70%" : "bottom top",
              scrub: 0.6,
              pin: wide,
            },
          });
          lines.forEach((line, i) => {
            const d = LINE_DEPTH[i];
            tl.to(line, { yPercent: -60 - 140 * d, scale: 1 + 0.9 * d, opacity: 0, ease: "power1.in" }, 0);
          });
          tl.to(".hero-logo", { yPercent: -90, scale: 1.5, opacity: 0, ease: "power1.in" }, 0)
            .to(".contours--hero", { scale: 1.7, opacity: 0.2, ease: "power1.in" }, 0)
            .to(".hero-note", { opacity: 0, ease: "none", duration: 0.4 }, 0)
            .to(".hero-foot", { y: -40, opacity: 0, ease: "none", duration: 0.5 }, 0);

          // Pointer parallax: nearer lines move further.
          if (!ctx.conditions.fine) return;
          const movers = lines.map((line, i) => ({
            x: gsap.quickTo(line.querySelector(".hero-line-inner"), "x", { duration: 1.2, ease: "power3.out" }),
            y: gsap.quickTo(line.querySelector(".hero-line-inner"), "y", { duration: 1.2, ease: "power3.out" }),
            d: LINE_DEPTH[i],
          }));
          const logo = root.current.querySelector(".hero-logo .bahr-logo");
          movers.push({
            x: gsap.quickTo(logo, "x", { duration: 1.4, ease: "power3.out" }),
            y: gsap.quickTo(logo, "y", { duration: 1.4, ease: "power3.out" }),
            d: 0.75,
          });
          const onMove = (e) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            movers.forEach((m) => {
              m.x(nx * -48 * m.d);
              m.y(ny * -22 * m.d);
            });
          };
          window.addEventListener("pointermove", onMove);
          return () => window.removeEventListener("pointermove", onMove);
        }
      );
    },
    { scope: root }
  );

  return (
    <section id="top" className="hero" ref={root}>
      <ContourField variant="chart" className="contours--hero" anchor=".hero-logo" />

      <div className="hero-logo">
        <BahrLogo label={t.hero.logo} />
      </div>

      <h1 className="hero-title" aria-label={t.hero.label}>
        {t.hero.lines.map((text, i) => (
          <span key={i} className={`hero-line hero-line--${i + 1}`} aria-hidden="true">
            <span className="hero-line-inner">{text}</span>
            {i === 1 && (
              <span className="hero-note" lang={lang === "ar" ? "en" : "ar"} title={t.hero.noteLabel}>
                {t.hero.note}
              </span>
            )}
          </span>
        ))}
      </h1>

      <div className="hero-foot">
        <p className="hero-intro">
          {t.hero.intro[0]}
          <br />
          <span className="muted">{t.hero.intro[1]}</span>
        </p>
        <p className="hero-coords mono" dir="ltr">
          21.4858° N · 39.1925° E
          <br />
          <span className="muted">{t.hero.sea}</span>
        </p>
        <div className="hero-actions">
          <Magnetic>
            <button className="btn btn--solid" onClick={() => scrollToId("contact")}>
              {t.hero.cta} <span aria-hidden="true">↗</span>
            </button>
          </Magnetic>
          <button className="scroll-cue" onClick={() => scrollToId("about")}>
            <span>{t.hero.scroll}</span>
            <i aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
