import { useEffect, useRef, useState } from "react";
import { gsap, scrollToId, useGSAP } from "../lib/gsap";
import { EMAIL, LINKEDIN } from "../data";
import { useLang } from "../i18n";
import { NAV } from "../components/Header";

function JeddahTime() {
  const format = () =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
  const [time, setTime] = useState(format);

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="mono" dir="ltr">
      {time} AST
    </span>
  );
}

export default function Footer() {
  const root = useRef(null);
  const { t } = useLang();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".footer-mark span", {
          yPercent: 100,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 95%", end: "bottom bottom", scrub: 1 },
        });
      });
    },
    { scope: root }
  );

  return (
    <footer className="footer" ref={root}>
      <div className="footer-cols">
        <nav aria-label={t.footer.sitemap}>
          <span className="eyebrow muted">{t.footer.sitemap}</span>
          {NAV.map((id) => (
            <a key={id} href={`#${id}`} onClick={(e) => (e.preventDefault(), scrollToId(id))}>
              {t.nav[id]}
            </a>
          ))}
        </nav>
        <div>
          <span className="eyebrow muted">{t.footer.find}</span>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer">
            {t.footer.linkedin} ↗
          </a>
        </div>
        <div>
          <span className="eyebrow muted">{t.footer.city}</span>
          <JeddahTime />
          <span className="muted">{t.footer.line}</span>
        </div>
        <div className="footer-top">
          <button className="btn" onClick={() => scrollToId("top")}>
            {t.footer.back} <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>

      <div className="footer-mark" aria-hidden="true" dir="ltr">
        {"BAHR.".split("").map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>

      <div className="footer-base">
        <span>
          © {new Date().getFullYear()} {t.footer.rights}
        </span>
        <span>{t.footer.made}</span>
      </div>
    </footer>
  );
}
