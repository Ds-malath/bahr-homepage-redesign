import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { ScrollTrigger, useGSAP } from "../lib/gsap";
import { revealHeadings, revealItems } from "../lib/reveal";
import { PROJECTS, WORK_URL } from "../data";
import { useLang } from "../i18n";

const ease = [0.65, 0, 0.35, 1];

// Floating preview that trails the cursor. Lives in <body> so it is not
// moved by the smooth-scroll transform. Images roll up or down depending on
// which direction through the list you moved.
function Preview({ active, armed, t }) {
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 170, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 170, damping: 22, mass: 0.6 });
  const rotate = useTransform(useVelocity(sx), [-2500, 0, 2500], [-7, 0, 7], { clamp: true });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!armed) return null;
  const on = active >= 0;

  return createPortal(
    <motion.div className="work-preview" style={{ x: sx, y: sy, rotate }} aria-hidden="true">
      <motion.div
        className="work-preview-frame"
        initial={false}
        animate={{ scale: on ? 1 : 0.4, opacity: on ? 1 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {PROJECTS.map((p, i) => (
          <motion.img
            key={p.slug}
            src={`/projects/${p.slug}.jpg`}
            alt=""
            decoding="async"
            initial={false}
            animate={{
              clipPath: i === active ? "inset(0% 0% 0% 0%)" : i < active ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
              scale: i === active ? 1 : 1.25,
            }}
            transition={{ duration: 0.75, ease }}
          />
        ))}
        <span className="work-preview-label">{t.work.view} ↗</span>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function Work() {
  const root = useRef(null);
  const { t } = useLang();
  const [active, setActive] = useState(-1);
  const [armed, setArmed] = useState(false);
  const [fine] = useState(() => window.matchMedia("(pointer: fine) and (min-width: 900px)").matches);

  useGSAP(
    () => {
      revealHeadings(root.current);
      revealItems(root.current);
      // Fetch preview images only once the section is close.
      if (fine) ScrollTrigger.create({ trigger: root.current, start: "top 200%", once: true, onEnter: () => setArmed(true) });
    },
    { scope: root }
  );

  return (
    <section id="work" className="section work" ref={root}>
      <div className="section-head">
        <span className="eyebrow">{t.work.eyebrow}</span>
        <span className="eyebrow muted">{t.work.aside} ↘</span>
      </div>

      <div className="work-head">
        <h2 className="display h2" data-split>
          {t.work.title}
          <sup className="mono">({String(PROJECTS.length).padStart(2, "0")})</sup>
        </h2>
        <p className="lede" data-reveal>
          {t.work.lede}
        </p>
      </div>

      <ul className="work-list" onPointerLeave={() => setActive(-1)}>
        {PROJECTS.map((p, i) => {
          const info = t.work.projects[p.slug];
          return (
            <li key={p.slug} data-reveal>
              <a
                className={`work-row ${active === i ? "is-active" : ""}`}
                href={`${WORK_URL}/${p.slug}/`}
                target="_blank"
                rel="noreferrer"
                data-cursor={fine ? "" : undefined}
                onPointerEnter={() => fine && setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(-1)}
              >
                <span className="work-num mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="work-name">{p.name}</span>
                <span className="work-meta mono">
                  {info.sector}
                  <br />
                  <span className="muted">
                    {info.type} · {p.year}
                  </span>
                </span>
                <span className="work-arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="work-media">
                  <img
                    src={`/projects/${p.slug}.jpg`}
                    alt={t.work.preview(p.name)}
                    loading="lazy"
                    decoding="async"
                    width="1440"
                    height="1440"
                  />
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="work-foot" data-reveal>
        <a className="btn" href={`${WORK_URL}/`} target="_blank" rel="noreferrer">
          {t.work.all} <span aria-hidden="true">↗</span>
        </a>
      </div>

      {fine && <Preview active={active} armed={armed} t={t} />}
    </section>
  );
}
