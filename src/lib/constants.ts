/**
 * Central site configuration — the single source of truth for who this
 * portfolio belongs to. Pulled from the live GitHub profile
 * (https://github.com/AliOmarAbdelhady). Fields marked `TODO` are the only
 * placeholders and should be replaced with real values.
 */
export const SITE = {
  name: "Ali Omar Abdelhady",
  shortName: "Ali Omar",
  firstName: "Ali",
  // Professional headline (tone per PROJECT_PLAN.md §22).
  headline:
    "I build intelligent web systems, computer vision tools, and data-driven AI experiences.",
  // Rotating role chips in the hero.
  roles: [
    "AI / Machine Learning",
    "Computer Vision",
    "Web Development",
    "Data Science",
    "Research Software",
  ],
  role: "Computer Science Student",
  institution: "Arab Academy for Science, Technology and Maritime Transport",
  institutionShort: "AASTMT",
  location: "Egypt",

  // --- Real profile data (from GitHub) ---
  githubUsername: "AliOmarAbdelhady",
  githubUrl: "https://github.com/AliOmarAbdelhady",
  avatarUrl: "https://avatars.githubusercontent.com/u/191811402?v=4",
  orcid: "https://orcid.org/0009-0000-3269-4033",
  orcidId: "0009-0000-3269-4033",

  // --- TODO: replace these placeholders before deploying ---
  email: "ali.omar.abdelhady@gmail.com", // TODO: confirm real email
  linkedinUrl: "https://www.linkedin.com/in/aliamarabdelhady", // TODO: confirm handle
  resumeUrl: "", // TODO: drop a PDF in /public and set path (e.g. /resume.pdf)
  url: "https://ali-portfolio.vercel.app", // TODO: set to the deployed URL (SEO canonical)
  available: true,
} as const;

/** Focus areas shown around the hero / about sections. */
export const FOCUS_AREAS = [
  "Web Development",
  "Artificial Intelligence",
  "Computer Vision",
  "Data Science",
  "Machine Learning",
  "Research Software",
] as const;

/**
 * Navigation + section identity. Each section is a "station" on the Neural Road.
 * `id` is the DOM id used for scroll anchoring.
 */
export type NavItem = {
  id: string;
  label: string;
  station: string; // cinematic name
  index: string; // display index, e.g. "01"
};

export const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Home", station: "Entry Portal", index: "00" },
  { id: "about", label: "About", station: "Identity Node", index: "01" },
  { id: "skills", label: "Skills", station: "Orbit Station", index: "02" },
  { id: "projects", label: "Projects", station: "Build Archive", index: "03" },
  { id: "repositories", label: "Code Vault", station: "Code Vault", index: "04" },
  { id: "ai-lab", label: "AI Lab", station: "Vision Lab", index: "05" },
  { id: "data", label: "Insights", station: "Insight Chamber", index: "06" },
  { id: "timeline", label: "Journey", station: "Timeline Road", index: "07" },
  { id: "contact", label: "Contact", station: "Final Transmission", index: "08" },
];

export const NAV_LINKS = NAV_ITEMS.map(({ id, label }) => ({ id, label }));

/** Animated dashboard metrics (Data Science section). */
export const DASHBOARD_METRICS = [
  { label: "Models Built", value: 12, suffix: "+" },
  { label: "Datasets Processed", value: 30, suffix: "+" },
  { label: "Projects Shipped", value: 18, suffix: "+" },
  { label: "Technologies", value: 40, suffix: "+" },
] as const;

/** Terminal transcript lines for the Contact section. */
export const TERMINAL_LINES = [
  { cmd: "system.status()", out: "Portfolio online. All systems nominal." },
  { cmd: "contact.available()", out: SITE.available ? "true" : "false" },
  {
    cmd: "open.channels()",
    out: "GitHub · ORCID · LinkedIn · Email",
  },
  { cmd: "whoami", out: `${SITE.name} — ${SITE.role}` },
] as const;

/** SEO metadata helpers. */
export const SEO = {
  title: `${SITE.name} — AI, Web, Computer Vision & Data Science Portfolio`,
  description:
    "Interactive 3D portfolio showcasing web development, AI, computer vision, data science, and software engineering projects by " +
    SITE.name +
    ".",
  keywords: [
    "Ali Omar Abdelhady",
    "AI engineer",
    "computer vision",
    "data science",
    "machine learning",
    "web development",
    "Next.js",
    "Python",
    "PyTorch",
    "portfolio",
  ],
} as const;
