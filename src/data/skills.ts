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
 * Skills grouped to match the CV — languages, AI/ML, robotics, web, data, and
 * the daily-driver toolchain. Levels are self-assessed proficiency (0–100).
 */
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "languages",
    title: "Languages",
    accent: "primary",
    description: "The core languages I build with across systems and apps.",
    skills: [
      { name: "Python", level: 92 },
      { name: "C++", level: 84 },
      { name: "JavaScript", level: 84 },
      { name: "TypeScript", level: 82 },
      { name: "C", level: 76 },
      { name: "Java", level: 74 },
      { name: "PHP", level: 68 },
    ],
  },
  {
    id: "ai-ml",
    title: "AI / Machine Learning",
    accent: "secondary",
    description: "Modeling, perception, and deployment for vision and AI.",
    skills: [
      { name: "PyTorch", level: 86 },
      { name: "YOLOv8 / YOLO11", level: 88 },
      { name: "OpenCV", level: 86 },
      { name: "Ultralytics", level: 84 },
      { name: "CUDA", level: 78 },
      { name: "ORB-SLAM2", level: 72 },
      { name: "3D Gaussian Splatting", level: 70 },
    ],
  },
  {
    id: "robotics",
    title: "Robotics & Autonomy",
    accent: "tertiary",
    description: "Autonomous systems, simulation, and vehicle control.",
    skills: [
      { name: "ROS2 Humble", level: 84 },
      { name: "Nav2", level: 78 },
      { name: "Gazebo Harmonic", level: 76 },
      { name: "Behavior Trees", level: 76 },
      { name: "MAVROS / MAVLink", level: 74 },
      { name: "ArduSub SITL", level: 72 },
    ],
  },
  {
    id: "web",
    title: "Web / Backend",
    accent: "success",
    description: "Full-stack interfaces, APIs, and databases.",
    skills: [
      { name: "React", level: 88 },
      { name: "Next.js", level: 86 },
      { name: "Node.js", level: 80 },
      { name: "HTML / CSS", level: 88 },
      { name: "Flask", level: 78 },
      { name: "Django", level: 76 },
      { name: "PostgreSQL", level: 76 },
      { name: "Supabase", level: 74 },
    ],
  },
  {
    id: "data",
    title: "Data Science",
    accent: "warning",
    description: "Analysis, manipulation, and visualization of data.",
    skills: [
      { name: "NumPy", level: 86 },
      { name: "Pandas", level: 84 },
      { name: "SQL", level: 80 },
      { name: "MySQL", level: 76 },
      { name: "Matplotlib", level: 78 },
      { name: "Power BI", level: 70 },
    ],
  },
  {
    id: "tools",
    title: "Tools & Infra",
    accent: "danger",
    description: "The daily-driver toolchain.",
    skills: [
      { name: "Git", level: 90 },
      { name: "GitHub", level: 92 },
      { name: "VS Code", level: 92 },
      { name: "Jupyter", level: 86 },
      { name: "Streamlit", level: 84 },
      { name: "Gradio", level: 80 },
      { name: "Docker", level: 76 },
      { name: "Linux", level: 82 },
      { name: "RViz2", level: 72 },
    ],
  },
  {
    id: "devops",
    title: "DevOps & Infrastructure",
    accent: "primary",
    description:
      "Serving and maintaining real production systems — from VPS provisioning to CI/CD pipelines.",
    skills: [
      { name: "VPS (Contabo · DigitalOcean)", level: 84 },
      { name: "CI/CD (GitHub Actions)", level: 85 },
      { name: "Vercel", level: 86 },
      { name: "Cloudflare", level: 80 },
      { name: "Nginx / Reverse Proxy", level: 74 },
      { name: "Server Maintenance & Backups", level: 80 },
      { name: "Load Testing", level: 72 },
      { name: "Self-Hosted Supabase", level: 75 },
    ],
  },
];

/** Flat list of all skill names — used by the orbit / tag clouds. */
export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills.map((s) => s.name));
