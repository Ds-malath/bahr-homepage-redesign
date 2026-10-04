# Bahr — Homepage Redesign

A concept redesign of the homepage of [Bahr](https://bybahr.com/), an independent digital agency in Jeddah, Saudi Arabia. Built for a university web design competition.

## Concept: the water column

Bahr's line is *"A deeper creative approach."* Here, depth is the interaction itself:

- **The page is the sea.** It starts on Bahr's own paper colour at the surface. As you scroll, the whole site descends through brand blue into the abyss, and the accent shifts from cobalt to Bahr's coral. A depth gauge counts down to 3,040 m, the deepest point of the Red Sea.
- **A live bathymetric chart.** The hero's contour lines are generated in real time (gradient noise and marching squares) and form a basin around the Bahr mark. The lines bend away from your cursor.
- **Depth in every section.** Hero type at three parallax depths. An exploded view of a real project's layers (surface, structure, system). Expertise planes that rise out of the dark and pass overhead. A work list with depth-of-field focus. Four disciplines that converge from different depths. A closing trench where every contour leads to one point.

## Features

- English and Arabic, with full right-to-left layout
- Dedicated mobile layouts, not shrunk desktop
- `prefers-reduced-motion` gives a complete static version
- Semantic HTML, keyboard focus states, skip link, accessible menu dialog
- Canvas work pauses when off-screen; no loader blocking the content

## Stack

React 19, Vite 7, GSAP 3 (ScrollTrigger, ScrollSmoother, SplitText) and Motion.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Structure

```
src/
  sections/     Hero, Agency, Expertise, Work, Difference, Contact, Footer
  components/   ContourField (live chart), Depth (palette + gauge), Header,
                BahrLogo, Cursor, Magnetic
  lib/          contours.js (noise + marching squares), gsap.js, reveal.js
  i18n.js       English / Arabic copy
  data.js       depth palettes and projects
```

## Credits

Unofficial concept, not affiliated with or endorsed by Bahr. The Bahr name, logo, copy and project screenshots belong to Bahr and their clients, and are used here only for this redesign exercise.
