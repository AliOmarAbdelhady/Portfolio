/**
 * Professional experience — internships and active roles, sourced from the CV
 * and current work. Rendered by the Experience section ("Command Log", station 07).
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
    period: "Jan 2026 — Present",
    location: "New Cairo, Egypt",
    summary:
      "Ongoing internship on a multitenant CRM platform — from core search features to the Altanfeethi frontend and the Layla voice-AI mobile app.",
    highlights: [
      "Developed a Saved Search feature for a multitenant CRM platform, enabling users to create, save, and reuse complex search queries across candidate, client, and vacancy grids.",
      "Building the Altanfeethi frontend — an Nx monorepo shipping a member web app, an admin console, and an Expo mobile app over shared libraries, deployed to let-script.com.",
      "Developing Layla, an Expo voice-AI mobile app with EAS over-the-air updates for Android and iOS, plus SIP↔Gemini Live, FreeSWITCH, and Twilio telephony-AI bridges.",
      "Working with PostgreSQL full-text search, JSON filter rules, REST APIs, React, and Node.js within an agile team.",
    ],
    tags: ["React", "Node.js", "PostgreSQL", "Nx", "Expo", "VoIP/AI"],
    type: "internship",
    accent: "primary",
  },
  {
    id: "roben",
    role: "Head of Software & AI",
    org: "RobEn Club — AASTMT",
    period: "Ongoing",
    location: "Cairo, Egypt",
    summary:
      "Leading the club's software and AI division — the DARN platform on roben.club, the Learning Hub, and competition robotics.",
    highlights: [
      "Lead DARN (Damn Awesome RobEn Network), the club's platform at roben.club: HR system (members, meetings, warnings, ratings), the yearly recruitment cycle, and the public website — deployed on the club's own VPS with a self-hosted Supabase backend.",
      "Lead the RobEn Learning Hub (supabase.roben.club backend + Vercel frontend) for member education.",
      "Head software & AI for the club's MATE ROV competition vehicles (2nd place regionally in 2025 and 2026).",
    ],
    tags: ["Leadership", "Full-Stack", "DevOps", "Robotics", "AI"],
    type: "role",
    accent: "tertiary",
  },
  {
    id: "pulse",
    role: "Data Engineering Intern",
    org: "Pulse by Solutions",
    period: "August 2026 · 1 month",
    location: "Egypt",
    summary:
      "One-month intensive internship covering the data tower and data engineering end to end.",
    highlights: [
      "Completed a focused data-engineering internship: data tower concepts, pipeline design, data transformation, and engineering workflows used in modern data platforms.",
    ],
    tags: ["Data Engineering", "Data Tower", "Pipelines"],
    type: "internship",
    accent: "warning",
  },
  {
    id: "raya",
    role: "AI & RPA Intern",
    org: "Raya Information Technology",
    period: "July 2026",
    location: "Cairo, Egypt",
    summary:
      "RPA and automation internship — designing UiPath REFramework automations and AI-assisted process automation.",
    highlights: [
      "Built UiPath REFramework solutions, including an automation verifying account positions between web (System 1) and desktop (System 3) applications.",
      "Delivered coursework automations: employee registration workflows, Excel consolidation, exception handling, Integration Service, and invoice processing.",
    ],
    tags: ["UiPath", "RPA", "Automation", "AI"],
    type: "internship",
    accent: "secondary",
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
];
