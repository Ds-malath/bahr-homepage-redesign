import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { revealItems } from "../lib/reveal";
import { useLang } from "../i18n";
import ContourField from "../components/ContourField";
import Magnetic from "../components/Magnetic";
import { EMAIL } from "../data";

export default function Contact() {
  const root = useRef(null);
  const { t, lang } = useLang();

  useGSAP(
    () => {
      revealItems(root.current);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(".contact-title", {
          type: lang === "ar" ? "words,lines" : "chars,words,lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(lang === "ar" ? self.words : self.chars, {
              yPercent: 120,
              stagger: 0.025,
              ease: "none",
              scrollTrigger: { trigger: ".contact-title", start: "top 90%", end: "top 40%", scrub: 1 },
            }),
        });
        gsap.fromTo(
          ".contours--trench",
          { scale: 1.35, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 15%", scrub: true },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section id="contact" className="section contact" ref={root}>
      <ContourField variant="trench" className="contours--trench" />

      <div className="section-head">
        <span className="eyebrow">{t.contact.eyebrow}</span>
        <span className="eyebrow muted">{t.contact.aside}</span>
      </div>

      <h2 className="contact-title display">
        {t.contact.title[0]}
        <br />
        <em>{t.contact.title[1]}</em>
      </h2>

      <div className="contact-row">
        <p className="lede" data-reveal>
          {t.contact.lede[0]}
          <br />
          {t.contact.lede[1]}
        </p>

        <div className="contact-cta" data-reveal>
          <Magnetic strength={0.4}>
            <a className="orb" href={`mailto:${EMAIL}`} data-cursor="">
              <span>{t.contact.cta}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="contact-base" data-reveal>
        <a className="contact-email" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <span className="mono muted contact-depth">{t.contact.depth}</span>
      </div>
    </section>
  );
}
