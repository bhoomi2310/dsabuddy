import { prisma } from "../config/prismaClient.js";

const memoryCache = new Map();

export const clearAnalyticsCache = (username) => {
  if (!username) return;
  const lower = username.toLowerCase();
  for (const key of memoryCache.keys()) {
    if (key.includes(lower)) {
      memoryCache.delete(key);
    }
  }
};

const getCachedOrFetch = async (key, fetchFn, ttlMs = 15 * 60 * 1000) => {
  const cached = memoryCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const data = await fetchFn();
  memoryCache.set(key, { data, expiresAt: now + ttlMs });
  return data;
};

const getAuthUserId = (req) => req.user?.userId ?? req.user?._id ?? null;

const toMidnightUTC = (d) => {
  const date = new Date(d);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

/**
 * Compute the current streak (consecutive active days ending today or yesterday)
 * from a submission calendar map { unixTimestamp: count }.
 */
const computeCurrentStreak = (submissionCalendar) => {
  if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) return 0;

  // Normalise every timestamp to its UTC midnight timestamp
  const activeDaySet = new Set();
  for (const tsStr of Object.keys(submissionCalendar)) {
    const tsNum = Number(tsStr);
    const d = new Date(tsNum * 1000);
    const midnightTs = Math.floor(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000
    );
    activeDaySet.add(midnightTs);
  }

  // Today and yesterday midnight UTC (in seconds)
  const nowUtc = new Date();
  const todayTs = Math.floor(
    Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate()) / 1000
  );
  const yesterdayTs = todayTs - 86400;

  // Streak must be active (last submission was today or yesterday)
  let startTs = todayTs;
  if (!activeDaySet.has(todayTs)) {
    if (activeDaySet.has(yesterdayTs)) {
      startTs = yesterdayTs;
    } else {
      return 0;
    }
  }

  // Walk backwards from startTs
  let streak = 0;
  let cursor = startTs;
  while (activeDaySet.has(cursor)) {
    streak++;
    cursor -= 86400;
  }
  return streak;
};

export const listMyDailyActivity = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const take = req.query.take ?? 60;
  const skip = req.query.skip ?? 0;

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const from = req.query.from
    ? toMidnightUTC(req.query.from)
    : toMidnightUTC(defaultFrom);
  const to = req.query.to ? toMidnightUTC(req.query.to) : toMidnightUTC(now);

  const activities = await prisma.dailyActivity.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    take,
    skip,
    orderBy: [{ date: "asc" }],
    select: {
      id: true,
      date: true,
      count: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ dailyActivity: activities });
};

export const incrementMyDailyActivity = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const date = toMidnightUTC(req.body.date ?? new Date());
  const incrementBy = req.body.incrementBy ?? 1;

  const record = await prisma.dailyActivity.upsert({
    where: {
      userId_date: { userId, date },
    },
    create: { userId, date, count: incrementBy },
    update: { count: { increment: incrementBy } },
    select: { id: true, date: true, count: true, updatedAt: true },
  });

  return res.status(200).json({ dailyActivity: record });
};

import {
  fetchLeetCodeCalendar,
  fetchLeetCodeUserStats,
} from "../ingestion/leetcode.js";
import { fetchCodeforcesCalendar } from "../ingestion/codeforces.js";
import { fetchGfgCalendar } from "../ingestion/index.js";

export const getUnifiedAnalytics = async (req, res) => {
  try {
    let userId = null;
    const userNameParam = req.query.userName || req.query.username;

    if (userNameParam) {
      const targetUser = await prisma.user.findUnique({
        where: { userName: userNameParam },
        select: { id: true }
      });
      if (targetUser) {
        userId = targetUser.id;
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } else {
      userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
    }

    const platform = req.query.platform ?? "all";
    const yearParam = req.query.year ? Number(req.query.year) : null;

    // Get platform connections
    const connections = await prisma.platformConnection.findMany({
      where: { userId, synced: true },
    });

    const leetcodeConn = connections.find((c) => c.platform === "LEETCODE");
    const codeforcesConn = connections.find((c) => c.platform === "CODEFORCES");
    const gfgConn = connections.find((c) => c.platform === "GFG");

    // Gather active years dynamically
    const yearsSet = new Set([new Date().getUTCFullYear()]);

    // Local activity years
    const localActivities = await prisma.dailyActivity.findMany({
      where: { userId },
      select: { date: true },
    });
    localActivities.forEach((act) => {
      yearsSet.add(act.date.getUTCFullYear());
    });

    // LeetCode active years (fetch without year to get the full activeYears list)
    if (leetcodeConn) {
      try {
        const lcData = await getCachedOrFetch(
          `lc_cal_${leetcodeConn.username.toLowerCase()}_all`,
          () => fetchLeetCodeCalendar({ username: leetcodeConn.username })
        );
        if (Array.isArray(lcData?.activeYears)) {
          lcData.activeYears.forEach((y) => yearsSet.add(Number(y)));
        }
      } catch (e) {
        /* silently ignore */
      }
    }

    // Codeforces active years – derive from all submission timestamps
    if (codeforcesConn) {
      try {
        const cfData = await getCachedOrFetch(
          `cf_cal_${codeforcesConn.username.toLowerCase()}`,
          () => fetchCodeforcesCalendar({ username: codeforcesConn.username })
        );
        if (cfData?.submissionCalendar) {
          Object.keys(cfData.submissionCalendar).forEach((ts) => {
            const yr = new Date(Number(ts) * 1000).getUTCFullYear();
            if (yr > 2010) yearsSet.add(yr); // sanity-guard against bogus timestamps
          });
        }
      } catch (e) {
        /* silently ignore */
      }
    }

    // GFG active years – derive from all submission timestamps
    if (gfgConn) {
      try {
        const gfgData = await getCachedOrFetch(
          `gfg_cal_${gfgConn.username.toLowerCase()}`,
          () => fetchGfgCalendar({ username: gfgConn.username })
        );
        if (gfgData?.submissionCalendar) {
          Object.keys(gfgData.submissionCalendar).forEach((ts) => {
            const yr = new Date(Number(ts) * 1000).getUTCFullYear();
            if (yr > 2010) yearsSet.add(yr);
          });
        }
      } catch (e) {
        /* silently ignore */
      }
    }

    const activeYears = Array.from(yearsSet).sort((a, b) => b - a);

    // Define date range – always full calendar year so all past data is included
    const targetYear = yearParam ?? new Date().getUTCFullYear();
    const startDate = new Date(Date.UTC(targetYear, 0, 1));
    const endDate = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59));

    const minTs = Math.floor(startDate.getTime() / 1000);
    const maxTs = Math.floor(endDate.getTime() / 1000);

    const mergedActivity = {}; // timestamp (seconds) -> count

    // 1. Local Activity
    if (platform === "all" || platform === "local") {
      const localActivity = await prisma.dailyActivity.findMany({
        where: {
          userId,
          date: { gte: toMidnightUTC(startDate), lte: toMidnightUTC(endDate) },
        },
      });

      localActivity.forEach((act) => {
        const ts = Math.floor(act.date.getTime() / 1000);
        mergedActivity[ts] = (mergedActivity[ts] || 0) + act.count;
      });
    }

    // Per-platform raw calendars (all-time) – reused for per-platform streak
    let lcCalendar = null;
    let lcNativeStreak = 0;  // LeetCode returns its own streak value – trust it directly
    let cfCalendar = null;
    let gfgCalendar = null;

    // 2. Leetcode Activity
    if ((platform === "all" || platform === "leetcode") && leetcodeConn) {
      try {
        const lcData = await getCachedOrFetch(
          `lc_cal_${leetcodeConn.username.toLowerCase()}_${yearParam ?? 'current'}`,
          () => fetchLeetCodeCalendar({ username: leetcodeConn.username, year: yearParam })
        );
        if (lcData) {
          // Use LeetCode's own native streak (covers cross-year streaks correctly)
          lcNativeStreak = lcData.streak ?? 0;
          lcCalendar = lcData.submissionCalendar ?? {};
          for (const [ts, count] of Object.entries(lcCalendar)) {
            const tsNum = Number(ts);
            if (tsNum >= minTs && tsNum <= maxTs) {
              mergedActivity[tsNum] = (mergedActivity[tsNum] || 0) + count;
            }
          }
        }
      } catch (e) {
        console.error("Error fetching LeetCode calendar:", e.message || e);
      }
    } else if (leetcodeConn) {
      // Platform filter excludes LC for heatmap but we still need its streak
      try {
        const lcAllData = await getCachedOrFetch(
          `lc_cal_${leetcodeConn.username.toLowerCase()}_all`,
          () => fetchLeetCodeCalendar({ username: leetcodeConn.username })
        );
        if (lcAllData) {
          lcNativeStreak = lcAllData.streak ?? 0;
          lcCalendar = lcAllData.submissionCalendar ?? null;
        }
      } catch (e) { /* silently ignore */ }
    }

    // 3. Codeforces Activity
    if ((platform === "all" || platform === "codeforces") && codeforcesConn) {
      try {
        const cfData = await getCachedOrFetch(
          `cf_cal_${codeforcesConn.username.toLowerCase()}`,
          () => fetchCodeforcesCalendar({ username: codeforcesConn.username })
        );
        if (cfData?.submissionCalendar) {
          cfCalendar = cfData.submissionCalendar;
          for (const [ts, count] of Object.entries(cfData.submissionCalendar)) {
            const tsNum = Number(ts);
            if (tsNum >= minTs && tsNum <= maxTs) {
              mergedActivity[tsNum] = (mergedActivity[tsNum] || 0) + count;
            }
          }
        }
      } catch (e) {
        console.error("Error fetching Codeforces calendar:", e.message || e);
      }
    } else if (codeforcesConn) {
      try {
        const cfData = await getCachedOrFetch(
          `cf_cal_${codeforcesConn.username.toLowerCase()}`,
          () => fetchCodeforcesCalendar({ username: codeforcesConn.username })
        );
        cfCalendar = cfData?.submissionCalendar ?? null;
      } catch (e) { /* silently ignore */ }
    }

    // 4. GFG Activity
    if ((platform === "all" || platform === "gfg") && gfgConn) {
      try {
        const gfgData = await getCachedOrFetch(
          `gfg_cal_${gfgConn.username.toLowerCase()}`,
          () => fetchGfgCalendar({ username: gfgConn.username })
        );
        if (gfgData?.submissionCalendar) {
          gfgCalendar = gfgData.submissionCalendar;
          for (const [ts, count] of Object.entries(gfgData.submissionCalendar)) {
            const tsNum = Number(ts);
            if (tsNum >= minTs && tsNum <= maxTs) {
              mergedActivity[tsNum] = (mergedActivity[tsNum] || 0) + count;
            }
          }
        }
      } catch (e) {
        console.error("Error fetching GFG calendar:", e.message || e);
      }
    } else if (gfgConn) {
      try {
        const gfgData = await getCachedOrFetch(
          `gfg_cal_${gfgConn.username.toLowerCase()}`,
          () => fetchGfgCalendar({ username: gfgConn.username })
        );
        gfgCalendar = gfgData?.submissionCalendar ?? null;
      } catch (e) { /* silently ignore */ }
    }

    // Convert to heatmap array and calculate streak
    const heatmap = [];
    let activitySubmissions = 0; // raw daily submission count (for avg)
    let activeDays = 0;

    const sortedTimestamps = Object.keys(mergedActivity)
      .map(Number)
      .sort((a, b) => a - b);

    let currentStreak = 0;
    let bestStreak = 0;
    let lastDayTs = 0;

    for (const ts of sortedTimestamps) {
      const count = mergedActivity[ts];
      activitySubmissions += count;
      activeDays += 1;

      if (lastDayTs === 0 || ts - lastDayTs === 86400) {
        currentStreak += 1;
      } else if (ts - lastDayTs > 86400) {
        currentStreak = 1;
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      lastDayTs = ts;

      heatmap.push({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        count,
      });
    }

    // ── True "total solved" = sum of unique problems from platform connections ──
    const allConnections = await prisma.platformConnection.findMany({
      where: { userId, synced: true },
      select: {
        platform: true,
        username: true,
        rating: true,
        problemsSolved: true,
        rankLabel: true,
        stars: true,
        lastSyncedAt: true,
        topicBreakdown: true,
      },
    });

    let totalSolved = 0;
    const platformBreakdown = [];

    for (const conn of allConnections) {
      const solved = conn.problemsSolved ?? 0;
      // Only add to total if filtering allows this platform
      const pKey = conn.platform.toLowerCase();
      if (platform === "all" || platform === pKey) {
        totalSolved += solved;
      }

      // Per-platform current streak:
      // LeetCode → use native streak from their API (handles cross-year, timezone-aware)
      // CF/GFG  → compute from calendar data (no native streak field in their APIs)
      let platformStreak = 0;
      if (pKey === "leetcode") platformStreak = lcNativeStreak;
      else if (pKey === "codeforces") platformStreak = computeCurrentStreak(cfCalendar);
      else if (pKey === "gfg") platformStreak = computeCurrentStreak(gfgCalendar);

      platformBreakdown.push({
        platform: conn.platform,
        username: conn.username,
        rating: conn.rating,
        rankLabel: conn.rankLabel,
        stars: conn.stars,
        solved,
        lastSyncedAt: conn.lastSyncedAt,
        topicBreakdown: conn.topicBreakdown ?? {},
        currentStreak: platformStreak,
      });
    }

    // Fetch LC difficulty breakdown live (cheap, single request)
    let lcDifficulty = null;
    if (leetcodeConn) {
      try {
        const lcStats = await getCachedOrFetch(
          `lc_stats_${leetcodeConn.username.toLowerCase()}`,
          () => fetchLeetCodeUserStats({ username: leetcodeConn.username })
        );
        lcDifficulty = {
          easy: lcStats.easySolved ?? 0,
          medium: lcStats.mediumSolved ?? 0,
          hard: lcStats.hardSolved ?? 0,
          total: lcStats.problemsSolved ?? 0,
        };
      } catch (e) {
        /* silently ignore */
      }
    }

    const avgDaily =
      activeDays > 0 ? (activitySubmissions / activeDays).toFixed(1) : "0";

    const stats = [
      { label: "Avg. Daily Problems", value: avgDaily, color: "#10B981" },
      { label: "Active Days", value: String(activeDays), color: "#3B82F6" },
      { label: "Total Solved", value: String(totalSolved), color: "#F59E0B" },
      { label: "Best Streak", value: `${bestStreak} days`, color: "#8B5CF6" },
    ];

    return res.status(200).json({
      heatmap,
      stats,
      activeYears,
      platformBreakdown,
      lcDifficulty,
      totalSolved,
      activeDays,
      bestStreak,
    });
  } catch (error) {
    console.error("Error in getUnifiedAnalytics:", error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
