import { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { revealHeadings, revealItems } from "../lib/reveal";
import { useLang } from "../i18n";

export default function Expertise() {
  const root = useRef(null);
  const { t } = useLang();
  const items = t.services.items;
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      revealHeadings(root.current);
      const mm = gsap.matchMedia();

      // Desktop: pin, and move the camera down through three planes. Each one
      // rises out of the dark, comes into focus, then passes overhead.
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const planes = gsap.utils.toArray(".plane", root.current);
        gsap.set(planes, { opacity: 0, yPercent: 40, scale: 0.72, filter: "blur(14px)" });
        gsap.set(planes[0], { opacity: 1, yPercent: 0, scale: 1, filter: "blur(0px)" });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut", duration: 1 },
          scrollTrigger: {
            trigger: ".services-pin",
            start: "top top",
            end: () => "+=" + window.innerHeight * (planes.length - 0.4),
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => setActive(Math.min(planes.length - 1, Math.round(self.progress * (planes.length - 1)))),
          },
        });

        planes.forEach((plane, i) => {
          if (i === 0) return;
          const at = (i - 1) * 1.2 + 0.2;
          tl.to(planes[i - 1], { opacity: 0, yPercent: -30, scale: 1.25, filter: "blur(10px)" }, at).to(
            plane,
            { opacity: 1, yPercent: 0, scale: 1, filter: "blur(0px)" },
            at + 0.15
          );
        });
        tl.to({}, { duration: 0.3 });
      });

      mm.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => revealItems(root.current));
    },
    { scope: root }
  );

  return (
    <section id="services" className="expertise" ref={root}>
      <div className="section expertise-intro">
        <div className="section-head">
          <span className="eyebrow">{t.services.eyebrow}</span>
          <span className="eyebrow muted">{t.services.aside}</span>
        </div>
        <h2 className="display h2" data-split>
          {t.services.title[0]}
          <br />
          <em>{t.services.title[1]}</em>
        </h2>
      </div>

      <div className="services-pin">
        <ol className="services-index" aria-hidden="true">
          {items.map((s, i) => (
            <li key={s.title} className={i === active ? "is-active" : ""}>
              <span>0{i + 1}</span>
              {s.title}
            </li>
          ))}
        </ol>

        <ul className="planes">
          {items.map((s, i) => (
            <li key={s.title} className="plane" data-reveal>
              <span className="plane-num" aria-hidden="true">
                0{i + 1}
              </span>
              <div className="plane-body">
                <h3 className="plane-title">{s.title}</h3>
                <p>{s.body}</p>
                <ul className="tags">
                  {s.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
