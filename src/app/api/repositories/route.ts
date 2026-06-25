import { NextResponse } from "next/server";

import { fetchGitHubProfile, fetchGitHubRepositories } from "@/lib/github";
import { SHOWCASE_REPOSITORIES } from "@/data/repositories";

// Cache on the edge for 30 min; live data refreshes automatically.
export const revalidate = 1800;

/**
 * GET /api/repositories
 * Returns the live GitHub profile + repositories, plus curated showcase data
 * as an explicit fallback (labelled) so the Code Vault is never empty before
 * the owner publishes public repos.
 */
export async function GET() {
  const [repositories, profile] = await Promise.all([
    fetchGitHubRepositories(),
    fetchGitHubProfile(),
  ]);

  return NextResponse.json({
    profile,
    repositories, // live data (may be empty)
    fallback: SHOWCASE_REPOSITORIES, // clearly-labelled showcase capsules
    hasLive: repositories.length > 0,
    fetchedAt: new Date().toISOString(),
  });
}
