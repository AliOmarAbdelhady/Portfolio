import { SITE } from "@/lib/constants";
import type { Repository, RepoCategory, RepoStatus } from "@/data/repositories";

/**
 * Live GitHub integration.
 *
 * Fetches the owner's public repositories from the GitHub REST API and maps
 * them into the portfolio's `Repository` shape. Used by the /api/repositories
 * route so the Code Vault always reflects real, published work.
 *
 * If there are no public repos yet, the caller falls back to curated showcase
 * data (clearly labelled) so the section is never empty.
 */

const GITHUB_API = "https://api.github.com/users";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  homepage?: string | null;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

export type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
};

/** Fetch the public profile for the configured GitHub user. */
export async function fetchGitHubProfile(): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(`${GITHUB_API}/${SITE.githubUsername}`, {
      headers: buildHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as GitHubProfile;
  } catch {
    return null;
  }
}

/** Fetch + transform public repositories, sorted by last push. */
export async function fetchGitHubRepositories(): Promise<Repository[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/${SITE.githubUsername}/repos?per_page=100&sort=pushed&type=owner`,
      { headers: buildHeaders(), next: { revalidate: 1800 } },
    );
    if (!res.ok) return [];
    const data: GitHubRepo[] = await res.json();

    return data
      .filter((r) => !r.fork)
      .map(mapRepo)
      .sort((a, b) => (b.year > a.year ? 1 : b.year < a.year ? -1 : 0));
  } catch {
    return [];
  }
}

function mapRepo(r: GitHubRepo): Repository {
  return {
    id: `gh-${r.id}`,
    name: r.name,
    description: r.description ?? "No description provided.",
    language: r.language ?? "Text",
    technologies: dedupe([r.language ?? "", ...(r.topics ?? [])]),
    githubUrl: r.html_url,
    demoUrl: r.homepage || undefined,
    stars: r.stargazers_count,
    forks: r.forks_count,
    category: inferCategory(r),
    status: r.archived ? "Completed" : "In Progress",
    year: r.pushed_at?.slice(0, 4) ?? new Date().getFullYear().toString(),
    showcase: false,
  };
}

function inferCategory(r: GitHubRepo): RepoCategory {
  const text = `${r.name} ${r.description ?? ""} ${(r.topics ?? []).join(" ")}`.toLowerCase();
  if (/(vision|opencv|yolo|detection|cnn|segmentation|imag)/.test(text)) return "Computer Vision";
  if (/(ml|ai|llm|rag|model|neural|gpt|embedding|learning)/.test(text)) return "AI";
  if (/(data|dashboard|pandas|plotly|analys|etl|bi)/.test(text)) return "Data Science";
  if (/(tool|cli|config|template|utils|devops|docker)/.test(text)) return "Tools";
  return "Web";
}

function dedupe(arr: string[]): string[] {
  return Array.from(
    new Set(arr.map((s) => s.trim()).filter(Boolean).map(capitalize)),
  ).slice(0, 6);
}

function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Optional: authenticate to raise rate limits. Set GITHUB_TOKEN in env.
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export type { Repository, RepoCategory, RepoStatus };
