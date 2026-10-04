export const EMAIL = "dive@b7r.agency";
export const LINKEDIN = "https://www.linkedin.com/company/bybahr";
export const WORK_URL = "https://bybahr.com/work";

// The page is a water column. Each section sits at a depth, and the whole
// site's palette is interpolated between these stops as you scroll.
// `dark` marks which side of the contrast flip a stop is on.
export const DEPTHS = [
  {
    id: "top",
    metres: 0,
    dark: false,
    palette: {
      bg: "#e6e6df",
      ink: "#242423",
      muted: "#64645f",
      line: "rgba(36, 36, 35, 0.16)",
      accent: "#24559b",
      contour: "rgba(52, 66, 82, 0.34)",
    },
  },
  {
    id: "about",
    metres: 40,
    dark: false,
    palette: {
      bg: "#d6dbd9",
      ink: "#1d2226",
      muted: "#555c62",
      line: "rgba(29, 34, 38, 0.16)",
      accent: "#24559b",
      contour: "rgba(36, 85, 155, 0.3)",
    },
  },
  {
    id: "services",
    metres: 200,
    dark: true,
    palette: {
      bg: "#143a73",
      ink: "#eef0ea",
      muted: "rgba(238, 240, 234, 0.64)",
      line: "rgba(238, 240, 234, 0.18)",
      accent: "#ff9a80",
      contour: "rgba(238, 240, 234, 0.2)",
    },
  },
  {
    id: "work",
    metres: 1000,
    dark: true,
    palette: {
      bg: "#0a1832",
      ink: "#e6e6df",
      muted: "rgba(230, 230, 223, 0.58)",
      line: "rgba(230, 230, 223, 0.14)",
      accent: "#ff846a",
      contour: "rgba(230, 230, 223, 0.16)",
    },
  },
  {
    id: "difference",
    metres: 2000,
    dark: true,
    palette: {
      bg: "#060d1c",
      ink: "#e6e6df",
      muted: "rgba(230, 230, 223, 0.55)",
      line: "rgba(230, 230, 223, 0.13)",
      accent: "#ff846a",
      contour: "rgba(230, 230, 223, 0.14)",
    },
  },
  {
    id: "contact",
    // The deepest point of the Red Sea.
    metres: 3040,
    dark: true,
    palette: {
      bg: "#03060c",
      ink: "#e6e6df",
      muted: "rgba(230, 230, 223, 0.55)",
      line: "rgba(230, 230, 223, 0.13)",
      accent: "#ff846a",
      contour: "rgba(150, 180, 230, 0.22)",
    },
  },
];

export const PROJECTS = [
  { slug: "alageely", name: "Alageely", year: "2025" },
  { slug: "riyadh-retina", name: "Riyadh Retina", year: "2025" },
  { slug: "sycleague", name: "Sycleague", year: "2025" },
  { slug: "qvs", name: "QVS", year: "2025" },
  { slug: "parkinly", name: "Parkinly", year: "2025" },
  { slug: "secure-steps", name: "Secure Steps", year: "2025" },
  { slug: "mass", name: "MASS", year: "2026" },
  { slug: "lineup", name: "Lineup", year: "2026" },
];
