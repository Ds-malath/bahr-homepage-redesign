import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "./gsap";

// Call inside a section's useGSAP callback so everything is reverted on unmount.

// [data-split] → headings slide up line by line from a mask.
export function revealHeadings(scope) {
  if (prefersReducedMotion()) return;
  scope.querySelectorAll("[data-split]").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          stagger: 0.1,
          duration: 1.4,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }),
    });
  });
}

// [data-reveal] → fade up in batches as they enter the viewport.
export function revealItems(scope) {
  if (prefersReducedMotion()) return;
  const items = scope.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  gsap.set(items, { y: 40, opacity: 0 });
  ScrollTrigger.batch(items, {
    start: "top 90%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, stagger: 0.08, duration: 1.1, overwrite: true }),
  });
}
