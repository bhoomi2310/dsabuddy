import {
  syncCodeforcesProblemsByTags,
  fetchCodeforcesUserStats,
} from "./codeforces.js";
import {
  syncLeetCodeProblemsByTags,
  fetchLeetCodeUserStats,
} from "./leetcode.js";
import { fetchCodechefUserStats } from "./codechef.js";
import { fetchGfgUserStats, fetchGfgCalendar } from "./gfg.js";
export { fetchGfgCalendar };

export async function syncProblems({
  prisma,
  platforms = ["codeforces", "leetcode"],
  tagSlugs = [],
  maxItems = 200,
  dryRun = false,
} = {}) {
  const wanted = new Set(platforms.map((p) => String(p).toLowerCase()));

  const results = {};

  if (wanted.has("codeforces")) {
    try {
      results.codeforces = await syncCodeforcesProblemsByTags({
        prisma,
        tagSlugs,
        maxItems,
        dryRun,
      });
    } catch (error) {
      console.error("❌ Codeforces sync failed:", error);
      results.codeforces = { error: error.message || String(error) };
    }
  }

  if (wanted.has("leetcode")) {
    try {
      results.leetcode = await syncLeetCodeProblemsByTags({
        prisma,
        tagSlugs,
        maxItems,
        dryRun,
      });
    } catch (error) {
      console.error("❌ LeetCode sync failed:", error);
      results.leetcode = { error: error.message || String(error) };
    }
  }

  return results;
}

export async function syncUserStats({ platform, username }) {
  const platformLower = String(platform).toLowerCase();

  if (platformLower === "leetcode") {
    return await fetchLeetCodeUserStats({ username });
  }

  if (platformLower === "codeforces") {
    return await fetchCodeforcesUserStats({ username });
  }

  if (platformLower === "codechef") {
    return await fetchCodechefUserStats({ username });
  }

  if (platformLower === "gfg") {
    return await fetchGfgUserStats({ username });
  }

  throw new Error(`Platform '${platform}' user stats sync not implemented`);
}
