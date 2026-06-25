import { SITE } from "@/lib/constants";

export type TimelineItem = {
  id: string;
  period: string;
  title: string;
  org: string;
  description: string;
  tags: string[];
  accent: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger";
};

/**
 * Journey timeline. The education entry is real (AASTMT); milestone items are
 * representative placeholders — replace with your actual experience.
 */
export const TIMELINE: TimelineItem[] = [
  {
    id: "edu-aastmt",
    period: "2023 — Present",
    title: "B.Sc. Computer Science",
    org: SITE.institution,
    description:
      "Studying core CS, AI, and data science — building projects across web, computer vision, and machine learning.",
    tags: ["Computer Science", "AI", "Data Science"],
    accent: "primary",
  },
  {
    id: "ml-projects",
    period: "2024 — 2025",
    title: "Machine Learning Engineering",
    org: "Independent & Coursework",
    description:
      "Shipped end-to-end ML pipelines — detection, RAG, and decision-support — with reproducible evaluation.",
    tags: ["PyTorch", "Computer Vision", "LLMs"],
    accent: "secondary",
  },
  {
    id: "cv-research",
    period: "2024",
    title: "Computer Vision Research",
    org: "Research Projects",
    description:
      "Experimented with detection and segmentation models, focusing on evaluation rigor and deployment.",
    tags: ["YOLO", "OpenCV", "Medical Imaging"],
    accent: "tertiary",
  },
  {
    id: "web-shipping",
    period: "2023 — Present",
    title: "Full-Stack Web Development",
    org: "Freelance & Personal",
    description:
      "Built production-grade web apps with Next.js, TypeScript, and modern UI systems.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    accent: "success",
  },
];
