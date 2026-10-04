import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollSmoother, ScrollTrigger, prefersReducedMotion, useGSAP } from "./lib/gsap";
import { DICT, LangContext } from "./i18n";
import Header from "./components/Header";
import Cursor from "./components/Cursor";
import Depth from "./components/Depth";
import Hero from "./sections/Hero";
import Agency from "./sections/Agency";
import Expertise from "./sections/Expertise";
import Work from "./sections/Work";
import Difference from "./sections/Difference";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

const readLang = () => {
  try {
    return localStorage.getItem("bahr-lang") === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
};

// Rendered before #smooth-wrapper so its layout effect runs before any section
// creates a ScrollTrigger — ScrollSmoother has to exist first.
function Smoother({ paused, restoreTo }) {
  useGSAP(() => {
    if (!prefersReducedMotion() && ScrollTrigger.isTouch !== 1) {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.1,
        effects: true,
      });
    }
    return () => ScrollSmoother.get()?.kill();
  });

  // After a language switch, return to the same spot once everything is measured.
  useEffect(() => {
    if (!restoreTo) return;
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.scrollTop(restoreTo);
      else window.scrollTo(0, restoreTo);
    });
    return () => cancelAnimationFrame(id);
  }, [restoreTo]);

  useEffect(() => {
    ScrollSmoother.get()?.paused(paused);
    document.documentElement.classList.toggle("is-locked", paused);
  }, [paused]);

  return null;
}

// Everything that builds scroll animations. Remounted on language change so
// SplitText and ScrollTrigger rebuild cleanly against the new text direction.
function Site({ restoreTo }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <Smoother paused={menuOpen} restoreTo={restoreTo} />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="main">
            <Hero />
            <Agency />
            <Expertise />
            <Work />
            <Difference />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>

      {/* Fixed UI lives outside the smooth wrapper. Depth comes after the
          sections so its triggers are measured once the pins exist. */}
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Depth />
    </>
  );
}

export default function App() {
  const [lang, setLangState] = useState(readLang);
  const restoreTo = useRef(0);

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = DICT[lang].meta.title;
  }, [lang]);

  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);

  const setLang = useCallback((next) => {
    const smoother = ScrollSmoother.get();
    restoreTo.current = smoother ? smoother.scrollTop() : window.scrollY;
    try {
      localStorage.setItem("bahr-lang", next);
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
    setLangState(next);
  }, []);

  const value = useMemo(() => ({ lang, t: DICT[lang], setLang }), [lang, setLang]);

  return (
    <LangContext.Provider value={value}>
      <a className="skip" href="#about">
        {value.t.skip}
      </a>
      <Site key={lang} restoreTo={restoreTo.current} />
      <Cursor />
    </LangContext.Provider>
  );
}
