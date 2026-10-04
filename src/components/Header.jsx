import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { EMAIL, LINKEDIN } from "../data";
import { scrollToId } from "../lib/gsap";
import { useLang } from "../i18n";
import BahrLogo from "./BahrLogo";

export const NAV = ["top", "about", "services", "work", "contact"];

const ease = [0.76, 0, 0.24, 1];

export default function Header({ menuOpen, setMenuOpen }) {
  const { t, lang, setLang } = useLang();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burger = useRef(null);
  const menu = useRef(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240);
    setScrolled(y > 40);
  });

  // Menu: close on Escape, move focus in, and give it back to the toggle.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    const id = setTimeout(() => menu.current?.querySelector("a")?.focus(), 300);
    const toggle = burger.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(id);
      toggle?.focus({ preventScroll: true });
    };
  }, [menuOpen, setMenuOpen]);

  const go = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    // Let the smoother un-pause before scrolling.
    requestAnimationFrame(() => scrollToId(id));
  };

  const origin = lang === "ar" ? "48px 40px" : "calc(100% - 48px) 40px";

  return (
    <>
      <motion.header
        className={`header ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "is-menu" : ""}`}
        animate={{ y: hidden && !menuOpen ? "-120%" : "0%" }}
        transition={{ duration: 0.6, ease }}
      >
        <a className="logo" href="#top" onClick={(e) => go(e, "top")} aria-label={t.nav.home}>
          <BahrLogo />
        </a>

        <nav className="nav" aria-label={t.nav.primary}>
          {NAV.slice(1, 4).map((id, i) => (
            <a key={id} href={`#${id}`} onClick={(e) => go(e, id)}>
              <small>0{i + 1}</small>
              {t.nav[id]}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="lang"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            aria-label={t.nav.switchLabel}
            lang={lang === "en" ? "ar" : "en"}
          >
            {t.nav.switchTo}
          </button>
          <a className="pill" href="#contact" onClick={(e) => go(e, "contact")}>
            {t.nav.talk} <span aria-hidden="true">→</span>
          </a>
          <button
            ref={burger}
            className={`burger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="menu"
            aria-label={menuOpen ? t.nav.close : t.nav.open}
          >
            <i />
            <i />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu"
            ref={menu}
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.primary}
            initial={{ clipPath: `circle(0% at ${origin})` }}
            animate={{ clipPath: `circle(150% at ${origin})` }}
            exit={{ clipPath: `circle(0% at ${origin})` }}
            transition={{ duration: 0.9, ease }}
          >
            <motion.ul
              initial="closed"
              animate="open"
              exit="closed"
              variants={{ open: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}
            >
              {NAV.map((id, i) => (
                <li key={id}>
                  <motion.a
                    href={`#${id}`}
                    onClick={(e) => go(e, id)}
                    variants={{ closed: { y: "110%" }, open: { y: "0%" } }}
                    transition={{ duration: 0.8, ease }}
                  >
                    <small>0{i + 1}</small>
                    {t.nav[id]}
                  </motion.a>
                </li>
              ))}
            </motion.ul>
            <motion.div
              className="menu-foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
              exit={{ opacity: 0 }}
            >
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <a href={LINKEDIN} target="_blank" rel="noreferrer">
                {t.footer.linkedin} ↗
              </a>
              <button
                className="lang"
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                lang={lang === "en" ? "ar" : "en"}
              >
                {t.nav.switchTo}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
