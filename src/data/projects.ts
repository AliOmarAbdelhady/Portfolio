/**
 * Project content model — PROJECT_PLAN.md §11/§23.
 *
 * NOTE: These are curated SHOWCASE entries (not pulled from a live source yet).
 * They illustrate the portfolio's data shape and look complete today; replace
 * each entry's copy/links with your real projects when ready. `showcase: true`
 * flags them so the UI can label them honestly.
 */
export type ProjectCategory =
  | "Web"
  | "AI"
  | "Computer Vision"
  | "Data Science"
  | "Research"
  | "Biomedical";

export type Project = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  description: string;
  longDescription: string;
  problem: string;
  solution: string;
  features: string[];
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  image?: string;
  accent: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger";
  featured: boolean;
  year: string;
  showcase?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "neural-portfolio",
    slug: "neural-portfolio",
    title: "Neural Portfolio Experience",
    subtitle: "This interactive 3D portfolio",
    category: "Web",
    description:
      "A cinematic, scroll-driven 3D portfolio built on the “Neural Road” concept using React Three Fiber, GSAP, and Lenis.",
    longDescription:
      "A single-page immersive experience where visitors walk forward through a futuristic road of glowing stations. Combines real-time WebGL, smooth scroll choreography, glassmorphic UI, and accessibility fallbacks.",
    problem:
      "Developer portfolios usually feel flat and templated, failing to communicate technical depth at first glance.",
    solution:
      "An engine-grade portfolio: a fixed WebGL canvas behind scroll-synchronized HTML overlays, with reduced-motion and mobile fallbacks so it stays usable for everyone.",
    features: [
      "Scroll-synced 3D camera rig",
      "Glassmorphic project & repository stations",
      "Custom cursor + magnetic buttons",
      "Dark-first theme with polished light mode",
      "prefers-reduced-motion + mobile fallbacks",
    ],
    technologies: ["Next.js", "TypeScript", "React Three Fiber", "Three.js", "GSAP", "Lenis", "Tailwind CSS"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    accent: "primary",
    featured: true,
    year: "2025",
    showcase: true,
  },
  {
    id: "vision-detection",
    slug: "vision-detection",
    title: "Computer Vision Detection System",
    subtitle: "Real-time object detection pipeline",
    category: "Computer Vision",
    description:
      "A detection pipeline for identifying objects in images using modern deep learning models, preprocessing workflows, and evaluation metrics.",
    longDescription:
      "An end-to-end vision pipeline: ingestion, augmentation, model inference (YOLO-based), post-processing, and rich evaluation with mAP / precision-recall.",
    problem:
      "Building reproducible vision pipelines usually means gluing brittle scripts with inconsistent evaluation.",
    solution:
      "A modular pipeline with a single config-driven entrypoint, reusable preprocessing blocks, and standardized metrics reporting.",
    features: [
      "YOLO-based real-time detection",
      "Config-driven preprocessing & augmentation",
      "mAP / precision-recall evaluation",
      "Streamlit demo interface",
      "Batch + single-image inference",
    ],
    technologies: ["Python", "OpenCV", "YOLO", "PyTorch", "Streamlit", "NumPy"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    accent: "tertiary",
    featured: true,
    year: "2025",
    showcase: true,
  },
  {
    id: "biomedical-dss",
    slug: "biomedical-dss",
    title: "Biomedical Decision Support System",
    subtitle: "Clinical prediction assistant",
    category: "Biomedical",
    description:
      "A decision-support prototype that surfaces likely conditions from structured patient data, with explainable, confidence-scored outputs.",
    longDescription:
      "A research-oriented system combining feature engineering, calibrated classifiers, and SHAP-style explanations to support — not replace — clinical judgment.",
    problem:
      "Clinicians need fast, explainable second opinions, not opaque black boxes.",
    solution:
      "A calibrated, interpretable model with per-prediction feature attribution and a clean review interface.",
    features: [
      "Calibrated probabilistic outputs",
      "Per-prediction feature attribution",
      "Structured-data preprocessing pipeline",
      "Review-friendly interface",
      "Audit-ready prediction logs",
    ],
    technologies: ["Python", "Scikit-learn", "Pandas", "SHAP", "FastAPI"],
    accent: "danger",
    featured: true,
    year: "2024",
    showcase: true,
  },
  {
    id: "data-dashboard",
    slug: "data-dashboard",
    title: "Data Science Insight Dashboard",
    subtitle: "Interactive analytics surface",
    category: "Data Science",
    description:
      "A dashboard that turns messy datasets into interactive, explorable insights with drill-downs and automated summaries.",
    longDescription:
      "Covers the full loop: cleaning, feature engineering, statistical profiling, and interactive visualization. Designed so non-technical stakeholders can self-serve answers.",
    problem:
      "Static reports go stale and hide the interesting questions.",
    solution:
      "A live, filterable dashboard with automated profiling and explainable charts.",
    features: [
      "Automated data profiling",
      "Interactive filtering & drill-down",
      "Statistical summaries",
      "Exportable insights",
    ],
    technologies: ["Python", "Pandas", "Plotly", "SQL", "Power BI"],
    accent: "success",
    featured: true,
    year: "2024",
    showcase: true,
  },
  {
    id: "ml-tracker",
    slug: "ml-tracker",
    title: "ML Experiment Tracker",
    subtitle: "Reproducible model training logs",
    category: "AI",
    description:
      "A lightweight experiment-tracking tool that records parameters, metrics, and artifacts for every training run.",
    longDescription:
      "Captures hyperparameters, environment, and metrics per run so experiments are reproducible and comparable across a team.",
    problem:
      "Spreadsheets and memory are a terrible way to track ML experiments.",
    solution:
      "An append-only run registry with diffing and comparison views.",
    features: [
      "Parameter + metric logging",
      "Run comparison & diffing",
      "Artifact storage",
      "Reproducible environment snapshots",
    ],
    technologies: ["Python", "FastAPI", "SQLite", "React", "TypeScript"],
    accent: "secondary",
    featured: false,
    year: "2024",
    showcase: true,
  },
  {
    id: "rag-assistant",
    slug: "rag-assistant",
    title: "RAG Knowledge Assistant",
    subtitle: "Retrieval-augmented Q&A",
    category: "AI",
    description:
      "A retrieval-augmented assistant that grounds answers in your own documents with citations.",
    longDescription:
      "Chunks, embeds, and indexes a document corpus, then retrieves and re-ranks passages to ground LLM answers with source citations.",
    problem:
      "LLMs hallucinate when asked about private or recent knowledge.",
    solution:
      "A grounded RAG pipeline with cited, retrievable evidence for every answer.",
    features: [
      "Document chunking + embedding index",
      "Hybrid retrieval & re-ranking",
      "Cited, source-grounded answers",
      "Streaming responses",
    ],
    technologies: ["Python", "LangChain", "Vector DB", "LLMs", "FastAPI"],
    accent: "secondary",
    featured: false,
    year: "2025",
    showcase: true,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Web",
  "AI",
  "Computer Vision",
  "Data Science",
  "Research",
  "Biomedical",
];
