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
    "I build computer vision systems, autonomous robotics, and data-driven AI experiences.",
  // Rotating role chips in the hero.
  roles: [
    "AI & Machine Learning",
    "Computer Vision",
    "Robotics / ROS2",
    "Full-Stack Web",
    "Data Science",
  ],
  role: "Computer Science Student",
  institution: "Arab Academy for Science, Technology and Maritime Transport",
  institutionShort: "AASTMT",
  location: "Cairo, Egypt",

  // --- Real profile data (from GitHub) ---
  githubUsername: "AliOmarAbdelhady",
  githubUrl: "https://github.com/AliOmarAbdelhady",
  avatarUrl: "https://avatars.githubusercontent.com/u/191811402?v=4",
  orcid: "https://orcid.org/0009-0000-3269-4033",
  orcidId: "0009-0000-3269-4033",

  // --- Contact channels (verified against CV) ---
  email: "aliomarsaleh2005@gmail.com",
  // E.164 for tel: links; pretty form for display.
  phone: "+201284420622",
  phoneDisplay: "+20 128 442 0622",
  linkedinUrl: "https://www.linkedin.com/in/ali-omar-saleh",
  facebookUrl: "https://www.facebook.com/ali.omar.615266",
  instagramUrl: "https://www.instagram.com/ali_omar_abdelhady/",

  // CV served statically from /public.
  resumeUrl: "/resume.pdf",

  // TODO: set to the deployed URL (SEO canonical).
  url: "https://ali-portfolio.vercel.app",
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
  { id: "experience", label: "Experience", station: "Command Log", index: "07" },
  { id: "timeline", label: "Journey", station: "Timeline Road", index: "08" },
  { id: "contact", label: "Contact", station: "Final Transmission", index: "09" },
];

export const NAV_LINKS = NAV_ITEMS.map(({ id, label }) => ({ id, label }));

/**
 * Animated dashboard metrics (Data Science section). Values reflect real
 * shipped work — models trained, datasets processed, projects shipped, and the
 * breadth of the stack — not aspirational rounding.
 */
export const DASHBOARD_METRICS = [
  { label: "AI Models Trained", value: 6, suffix: "+" },
  { label: "Datasets Processed", value: 10, suffix: "+" },
  { label: "Projects Shipped", value: 5, suffix: "+" },
  { label: "Technologies", value: 25, suffix: "+" },
] as const;

/** Terminal transcript lines for the Contact section. */
export const TERMINAL_LINES = [
  { cmd: "system.status()", out: "Portfolio online. All systems nominal." },
  { cmd: "contact.available()", out: SITE.available ? "true" : "false" },
  {
    cmd: "open.channels()",
    out: "GitHub · LinkedIn · ORCID · Email · Phone",
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
    "robotics",
    "ROS2",
    "autonomous underwater vehicle",
    "data science",
    "machine learning",
    "web development",
    "Next.js",
    "Python",
    "PyTorch",
    "YOLO",
    "portfolio",
  ],
} as const;
