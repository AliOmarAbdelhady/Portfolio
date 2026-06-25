/**
 * Repository data model — PROJECT_PLAN.md §24.
 *
 * The repositories section ALSO fetches live data from the GitHub API
 * (see src/lib/github.ts + the /api/repositories route). The entries below are
 * curated SHOWCASE capsules used until live repos are published; they are
 * clearly labelled so nothing masquerades as real GitHub data. Live repos
 * always take precedence and render first.
 */
export type RepoCategory = "Web" | "AI" | "Computer Vision" | "Data Science" | "Tools";
export type RepoStatus = "Completed" | "In Progress" | "Experimental";

export type Repository = {
  id: string;
  name: string;
  description: string;
  language: string;
  technologies: string[];
  githubUrl: string;
  demoUrl?: string;
  stars?: number;
  forks?: number;
  category: RepoCategory;
  status: RepoStatus;
  year: string;
  /** Marks curated placeholder data vs. live GitHub data. */
  showcase?: boolean;
};

export const SHOWCASE_REPOSITORIES: Repository[] = [
  {
    id: "repo-portfolio",
    name: "neural-portfolio",
    description: "Interactive 3D developer portfolio — React Three Fiber + GSAP + Lenis.",
    language: "TypeScript",
    technologies: ["Next.js", "Three.js", "GSAP"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    category: "Web",
    status: "In Progress",
    year: "2025",
    showcase: true,
  },
  {
    id: "repo-vision",
    name: "vision-detection",
    description: "End-to-end object detection pipeline with evaluation metrics.",
    language: "Python",
    technologies: ["PyTorch", "YOLO", "OpenCV"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    category: "Computer Vision",
    status: "Experimental",
    year: "2025",
    showcase: true,
  },
  {
    id: "repo-rag",
    name: "rag-assistant",
    description: "Retrieval-augmented Q&A grounded in your own documents.",
    language: "Python",
    technologies: ["LangChain", "LLMs", "FastAPI"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    category: "AI",
    status: "Experimental",
    year: "2025",
    showcase: true,
  },
  {
    id: "repo-tracker",
    name: "ml-experiment-tracker",
    description: "Lightweight, reproducible ML experiment logging.",
    language: "Python",
    technologies: ["FastAPI", "SQLite", "React"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    category: "AI",
    status: "Completed",
    year: "2024",
    showcase: true,
  },
  {
    id: "repo-dss",
    name: "biomedical-dss",
    description: "Explainable biomedical decision-support prototype.",
    language: "Python",
    technologies: ["Scikit-learn", "SHAP", "Pandas"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    category: "AI",
    status: "Experimental",
    year: "2024",
    showcase: true,
  },
  {
    id: "repo-dashboard",
    name: "insight-dashboard",
    description: "Interactive data-science dashboard with automated profiling.",
    language: "Python",
    technologies: ["Plotly", "Pandas", "SQL"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    category: "Data Science",
    status: "Completed",
    year: "2024",
    showcase: true,
  },
];

export const REPO_CATEGORIES: (RepoCategory | "All")[] = [
  "All",
  "Web",
  "AI",
  "Computer Vision",
  "Data Science",
  "Tools",
];
