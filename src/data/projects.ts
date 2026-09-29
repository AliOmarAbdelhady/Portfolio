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
  | "Robotics"
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
    id: "workplace-safety",
    slug: "workplace-safety",
    title: "Workplace Safety Detection System",
    subtitle: "Real-time PPE compliance with multi-model YOLO",
    category: "Computer Vision",
    description:
      "Real-time PPE compliance system running four specialized YOLO models to detect safety gear and flag violations on live video.",
    longDescription:
      "A production-leaning workplace-safety platform that runs four specialized YOLO models (YOLOv8m & YOLO11m) in parallel to detect safety vests, helmets, gloves, and seven classes of fire extinguishers. It supports real-time webcam capture, image upload, and batch folder processing, and automatically tracks PPE compliance — flagging missing helmets or gloves and exporting CSV summary reports.",
    problem:
      "Safety teams need instant, automatic verification that workers are wearing the right protective equipment; manual review of footage doesn't scale.",
    solution:
      "A multi-model detection pipeline with configurable confidence/IOU thresholds, CUDA-accelerated inference, and an interactive Streamlit UI that surfaces violations and compliance percentages in real time.",
    features: [
      "4 specialized YOLO models (YOLOv8m & YOLO11m)",
      "Real-time webcam, image & batch folder input",
      "Automated PPE compliance tracking + CSV export",
      "Configurable confidence & IOU thresholds",
      "CUDA GPU acceleration for multi-model inference",
    ],
    technologies: ["Python", "YOLOv8", "YOLO11", "PyTorch", "OpenCV", "Streamlit", "CUDA", "Ultralytics"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    accent: "tertiary",
    featured: true,
    year: "2025",
    showcase: true,
  },
  {
    id: "kraken-auv",
    slug: "kraken-auv",
    title: "Kraken — Autonomous Underwater Vehicle",
    subtitle: "ROS2 autonomy stack for the BlueROV2",
    category: "Robotics",
    description:
      "A ROS2 Humble autonomous control framework for the BlueROV2 with visual SLAM, 3D path planning, and sensor fusion.",
    longDescription:
      "An autonomous underwater vehicle stack built on ROS2 Humble for the BlueROV2. It combines visual SLAM localization, 3D path planning, and multi-sensor fusion to execute fully autonomous underwater missions, simulated in Gazebo Harmonic with realistic buoyancy, hydrodynamic drag, and ArduSub SITL.",
    problem:
      "Autonomous underwater navigation demands robust localization and control in a GPS-denied, physics-harsh environment.",
    solution:
      "A ROS2/Nav2 framework using ORB-SLAM2 stereo localization, custom Nav2 plugins and Behavior Trees for mission execution, and fused IMU + visual odometry + depth data for 6-DOF holonomic control via MAVROS/MAVLink.",
    features: [
      "ROS2 Humble control framework for BlueROV2",
      "Visual SLAM via ORB-SLAM2 + stereo cameras",
      "Custom Nav2 plugins & Behavior Trees",
      "6-DOF holonomic control via MAVROS/MAVLink",
      "Gazebo Harmonic sim with buoyancy & hydrodynamic drag",
    ],
    technologies: ["ROS2", "C++", "Python", "Nav2", "ORB-SLAM2", "Gazebo", "MAVROS", "Docker"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    accent: "secondary",
    featured: true,
    year: "2025",
    showcase: true,
  },
  {
    id: "sard",
    slug: "sard",
    title: "SARD — Search & Rescue Detection",
    subtitle: "UAV human detection with GPS geolocation",
    category: "AI",
    description:
      "A UAV search-and-rescue system that detects people in aerial imagery and maps their real-world GPS coordinates.",
    longDescription:
      "A search-and-rescue AI system for aerial UAV imagery. A fine-tuned YOLOv8m model detects people in small-object aerial scenes (>90% mAP@0.5 where most targets occupy <1% of the frame), while an EXIF/GPS pipeline converts detections to real-world latitude/longitude and 3D Gaussian Splatting reconstructs orthographic maps with georeferenced bounding boxes for rapid search-area visualization.",
    problem:
      "In search-and-rescue, spotting a person in vast aerial footage and knowing exactly where they are is the difference between rescue and loss.",
    solution:
      "An end-to-end pipeline: small-object detection on 5,755 augmented UAV images, EXIF-based GPS geolocation of each detection, 3D Gaussian Splatting map reconstruction, and a real-time Gradio interface with CUDA-accelerated batch inference.",
    features: [
      "YOLOv8m fine-tuned on 5,755 UAV images (>90% mAP@0.5)",
      "GPS/EXIF pipeline → real-world lat/long of detections",
      "3D Gaussian Splatting orthographic map reconstruction",
      "Georeferenced bounding-box overlays",
      "Gradio UI with CUDA-accelerated batch inference",
    ],
    technologies: ["Python", "YOLOv8", "PyTorch", "OpenCV", "Gradio", "3D Gaussian Splatting", "CUDA"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    accent: "danger",
    featured: true,
    year: "2025",
    showcase: true,
  },
  {
    id: "noaa-fish-tracking",
    slug: "noaa-fish-tracking",
    title: "NOAA — Real-Time Fish Tracking",
    subtitle: "Underwater multi-species tracking",
    category: "Computer Vision",
    description:
      "A real-time fish-tracking system built for the NOAA competition using a custom YOLOv8 model on underwater video.",
    longDescription:
      "An AI-based real-time fish tracking system developed for the NOAA competition. A custom YOLOv8 model — trained on a collected and annotated marine dataset — is integrated with OpenCV for efficient, real-time underwater tracking of multiple fish species under varying conditions.",
    problem:
      "Counting and tracking fish species in underwater video by hand is slow and inconsistent across conditions.",
    solution:
      "A custom-trained YOLOv8 model paired with an OpenCV tracking pipeline that detects and follows multiple fish species in real time under varying underwater conditions.",
    features: [
      "Custom YOLOv8 model on a collected marine dataset",
      "Real-time underwater tracking via OpenCV",
      "Multi-species detection under varying conditions",
      "Manual dataset collection & annotation",
    ],
    technologies: ["Python", "YOLOv8", "OpenCV", "PyTorch"],
    githubUrl: "https://github.com/AliOmarAbdelhady",
    accent: "success",
    featured: false,
    year: "2024",
    showcase: true,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);

/**
 * Filter taxonomy for the Build Archive. Derived from the categories that
 * actually appear in PROJECTS so no empty filter chips are shown.
 */
export const PROJECT_CATEGORIES: ProjectCategory[] = Array.from(
  new Set(PROJECTS.map((p) => p.category)),
);
