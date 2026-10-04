import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register once, before any component runs GSAP code.
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);

gsap.defaults({ ease: "expo.out", duration: 1.2 });

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll to a section id, going through ScrollSmoother when it is active.
export function scrollToId(id) {
  const target = id === "top" ? 0 : document.getElementById(id);
  if (target === null) return;
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(target, true, "top top");
  else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
  else target.scrollIntoView({ behavior: "smooth" });
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, useGSAP };
