import { prisma } from "../config/prismaClient.js";
import { syncUserStats } from "../ingestion/index.js";
import { recalculateUserPoints } from "../utils/points.js";
import { clearAnalyticsCache } from "./dailyActivity.controller.js";

const getAuthUserId = (req) => req.user?.userId ?? req.user?._id ?? null;

export const listMyPlatformConnections = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const connections = await prisma.platformConnection.findMany({
    where: { userId },
    orderBy: [{ platform: "asc" }],
    select: {
      id: true,
      platform: true,
      username: true,
      rating: true,
      stars: true,
      problemsSolved: true,
      rankLabel: true,
      synced: true,
      lastSyncedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ platformConnections: connections });
};

export const upsertMyPlatformConnection = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { platform } = req.params;

  const record = await prisma.platformConnection.upsert({
    where: {
      userId_platform: { userId, platform },
    },
    create: { userId, platform, ...req.body },
    update: { ...req.body },
    select: {
      id: true,
      platform: true,
      username: true,
      rating: true,
      stars: true,
      problemsSolved: true,
      rankLabel: true,
      synced: true,
      lastSyncedAt: true,
      updatedAt: true,
    },
  });

  if (record && record.username) {
    clearAnalyticsCache(record.username);
  }

  await recalculateUserPoints(userId);

  return res.status(200).json({ platformConnection: record });
};

export const deleteMyPlatformConnection = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { platform } = req.params;

  const existing = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId, platform } },
    select: { username: true },
  });

  await prisma.platformConnection.delete({
    where: { userId_platform: { userId, platform } },
  });

  if (existing && existing.username) {
    clearAnalyticsCache(existing.username);
  }

  await recalculateUserPoints(userId);

  return res.status(204).send();
};

export const syncMyPlatformStats = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { platform } = req.params;

    // Find existing connection to get username
    const existing = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId, platform } },
      select: { username: true },
    });

    if (!existing || !existing.username) {
      return res.status(400).json({
        error: `No username found for ${platform}. Please set it first via PUT /api/platform-connections/${platform}`,
      });
    }

    // Fetch stats from external platform
    const stats = await syncUserStats({
      platform,
      username: existing.username,
    });

    // Update the DB with fetched stats
    const updated = await prisma.platformConnection.update({
      where: { userId_platform: { userId, platform } },
      data: {
        problemsSolved: stats.problemsSolved,
        rating: stats.rating ?? stats.maxRating ?? null,
        rankLabel: stats.rankLabel ?? stats.maxRank ?? null,
        stars: stats.starRating ?? stats.stars ?? null,
        synced: true,
        lastSyncedAt: new Date(),
      },
      select: {
        id: true,
        platform: true,
        username: true,
        rating: true,
        stars: true,
        problemsSolved: true,
        rankLabel: true,
        synced: true,
        lastSyncedAt: true,
        updatedAt: true,
      },
    });

    // Clear analytics cache for this user since we just synced new data
    clearAnalyticsCache(existing.username);

    await recalculateUserPoints(userId);

    return res.status(200).json({
      message: "Platform stats synced successfully",
      platformConnection: updated,
      fetchedStats: stats,
    });
  } catch (error) {
    console.error("syncMyPlatformStats error:", error);
    return res.status(500).json({
      error: error.message ?? "Failed to sync platform stats",
    });
  }
};

