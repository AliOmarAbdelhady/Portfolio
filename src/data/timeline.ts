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
 * Journey timeline — education and verifiable competition results, all sourced
 * from the CV. Professional internships live in the Experience section.
 */
export const TIMELINE: TimelineItem[] = [
  {
    id: "edu-aastmt",
    period: "2023 — 2027",
    title: "B.Sc. Computer Science",
    org: `${SITE.institution} · Cairo, Egypt`,
    description:
      "Studying core CS, AI, and data science while building real systems across computer vision, autonomous robotics, and full-stack web. GPA 3.5 / 4.0.",
    tags: ["Computer Science", "AI", "Data Science", "GPA 3.5/4.0"],
    accent: "primary",
  },
  {
    id: "mate-rov-2026",
    period: "2026",
    title: "MATE ROV — 2nd Place",
    org: "Marine Advanced Technology Education",
    description:
      "Placed 2nd at the MATE ROV regional competition as a team member — designing, building, and piloting a remotely operated underwater vehicle.",
    tags: ["Robotics", "Engineering", "Teamwork"],
    accent: "tertiary",
  },
  {
    id: "mate-rov-2025",
    period: "2025",
    title: "MATE ROV — 2nd Place",
    org: "Marine Advanced Technology Education",
    description:
      "Earned 2nd place at MATE ROV, contributing to the vehicle's software and systems engineering alongside the team.",
    tags: ["Robotics", "Engineering", "Teamwork"],
    accent: "secondary",
  },
  {
    id: "acpc-2024",
    period: "2024",
    title: "ACPC — Participant",
    org: "Arab Collegiate Programming Contest",
    description:
      "Competed in the ACPC, sharpening algorithmic problem-solving and competitive programming under timed contest conditions.",
    tags: ["Competitive Programming", "Algorithms"],
    accent: "warning",
  },
];
