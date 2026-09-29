/**
 * Professional experience — internships and active roles, sourced verbatim
 * from the CV. Rendered by the Experience section ("Command Log", station 07).
 */
export type ExperienceType = "internship" | "role";

export type ExperienceItem = {
  id: string;
  role: string;
  org: string;
  period: string;
  location: string;
  /** One-line summary shown above the highlight bullets. */
  summary: string;
  /** Responsibility / achievement bullets (from the CV). */
  highlights: string[];
  tags: string[];
  type: ExperienceType;
  accent: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger";
};

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "klenka",
    role: "Software Development Intern",
    org: "Klenka",
    period: "Winter 2026 · Jan – Feb",
    location: "New Cairo, Egypt",
    summary:
      "Shipped a Saved Search feature on a multitenant CRM platform used across candidate, client, and vacancy workflows.",
    highlights: [
      "Developed a Saved Search feature for a multitenant CRM platform, enabling users to create, save, and reuse complex search queries across candidate, client, and vacancy grids.",
      "Worked with PostgreSQL full-text search, JSON filter rules, and REST API endpoints to support flexible, dynamic query handling.",
      "Built with React, Node.js, and PostgreSQL; collaborated within a team using agile practices.",
    ],
    tags: ["React", "Node.js", "PostgreSQL", "REST APIs"],
    type: "internship",
    accent: "primary",
  },
  {
    id: "cib",
    role: "Summer Intern — The Green Leap Program",
    org: "CIB (Commercial International Bank)",
    period: "August 2025",
    location: "Cairo, Egypt",
    summary:
      "Completed CIB's summer program with a sustainability-focused curriculum on sustainable finance.",
    highlights: [
      "Completed the CIB Summer internship, gaining deep understanding of banking principles, approaches, and best practices in sustainable finance.",
      "Participated in “The Green Leap” sustainability-focused program as an integral part of the internship curriculum.",
    ],
    tags: ["Sustainable Finance", "Banking", "Sustainability"],
    type: "internship",
    accent: "success",
  },
  {
    id: "roben",
    role: "Software Team Member",
    org: "RobEn Software & AI",
    period: "Ongoing",
    location: "Cairo, Egypt",
    summary:
      "Core team member contributing to software and AI development across multiple active robotics projects.",
    highlights: [
      "Contributing to software and AI development initiatives as a core team member across multiple active projects.",
    ],
    tags: ["Software Engineering", "AI", "Robotics", "Teamwork"],
    type: "role",
    accent: "tertiary",
  },
];
