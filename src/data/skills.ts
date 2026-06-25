export type Skill = {
  name: string;
  /** 0–100 proficiency used to size/score the skill orb. */
  level: number;
};

export type SkillCategory = {
  id: string;
  title: string;
  /** Station accent token used for color theming (see globals.css). */
  accent: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger";
  description: string;
  skills: Skill[];
};

/**
 * Skills grouped into the categories from PROJECT_PLAN.md §12.
 */
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "web",
    title: "Web Development",
    accent: "primary",
    description: "Full-stack interfaces, APIs, and deployment.",
    skills: [
      { name: "Next.js", level: 88 },
      { name: "React", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "Tailwind CSS", level: 90 },
      { name: "shadcn/ui", level: 82 },
      { name: "Node.js", level: 78 },
      { name: "REST APIs", level: 82 },
      { name: "Authentication", level: 72 },
    ],
  },
  {
    id: "ai",
    title: "AI / Machine Learning",
    accent: "secondary",
    description: "Modeling, LLMs, retrieval, and evaluation.",
    skills: [
      { name: "Python", level: 90 },
      { name: "PyTorch", level: 80 },
      { name: "TensorFlow", level: 74 },
      { name: "Scikit-learn", level: 84 },
      { name: "LLMs", level: 82 },
      { name: "RAG", level: 78 },
      { name: "Prompt Engineering", level: 85 },
      { name: "Model Evaluation", level: 80 },
    ],
  },
  {
    id: "vision",
    title: "Computer Vision",
    accent: "tertiary",
    description: "Detection, segmentation, and medical imaging.",
    skills: [
      { name: "OpenCV", level: 84 },
      { name: "YOLO", level: 80 },
      { name: "CNNs", level: 82 },
      { name: "Image Classification", level: 82 },
      { name: "Object Detection", level: 80 },
      { name: "Segmentation", level: 74 },
      { name: "Medical Imaging", level: 70 },
    ],
  },
  {
    id: "data",
    title: "Data Science",
    accent: "success",
    description: "Analysis, visualization, and feature work.",
    skills: [
      { name: "Pandas", level: 88 },
      { name: "NumPy", level: 88 },
      { name: "Matplotlib", level: 80 },
      { name: "SQL", level: 82 },
      { name: "Power BI", level: 74 },
      { name: "Statistics", level: 80 },
      { name: "Feature Engineering", level: 82 },
    ],
  },
  {
    id: "tools",
    title: "Tools & Infra",
    accent: "warning",
    description: "The daily driver toolchain.",
    skills: [
      { name: "Git", level: 90 },
      { name: "GitHub", level: 90 },
      { name: "Docker", level: 70 },
      { name: "Linux", level: 82 },
      { name: "VS Code", level: 92 },
      { name: "Jupyter", level: 88 },
      { name: "PostgreSQL", level: 74 },
      { name: "Vercel", level: 82 },
    ],
  },
  {
    id: "design",
    title: "Design / UI",
    accent: "danger",
    description: "Interface craft and motion.",
    skills: [
      { name: "Figma", level: 78 },
      { name: "Animation", level: 82 },
      { name: "3D UI", level: 76 },
      { name: "UX Design", level: 80 },
      { name: "Responsive Design", level: 88 },
      { name: "Accessibility", level: 80 },
    ],
  },
];

/** Flat list of all skill names — used by the orbit / tag clouds. */
export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills.map((s) => s.name));
