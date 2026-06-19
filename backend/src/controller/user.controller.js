import { prisma } from "../config/prismaClient.js";

// Platform enum map: frontend sortBy value -> DB platform enum value
const PLATFORM_SORT_MAP = {
  leetcode: "LEETCODE",
  codeforces: "CODEFORCES",
  codechef: "CODECHEF",
};

export const enrichUserWithRanks = async (user) => {
  if (!user) return null;
  const points = user.points ?? 0;

  const [overallRank, collegeRank, branchRank, yearRank] = await Promise.all([
    prisma.user.count({
      where: { points: { gt: points } },
    }).then(n => n + 1),
    user.college
      ? prisma.user.count({
          where: { college: user.college, points: { gt: points } },
        }).then(n => n + 1)
      : Promise.resolve(null),
    user.branch
      ? prisma.user.count({
          where: { branch: user.branch, points: { gt: points } },
        }).then(n => n + 1)
      : Promise.resolve(null),
    user.year
      ? prisma.user.count({
          where: { year: user.year, points: { gt: points } },
        }).then(n => n + 1)
      : Promise.resolve(null),
  ]);

  return {
    ...user,
    overallRank,
    collegeRank,
    branchRank,
    yearRank,
  };
};

export const getLeaderboard = async (req, res) => {
  const take = parseInt(req.query.take ?? 50, 10);
  const skip = parseInt(req.query.skip ?? 0, 10);
  const filter = req.query.filter;   // 'college' | 'branch' | 'year'
  const sortBy = req.query.sortBy;   // 'all' | 'leetcode' | 'codeforces' | 'codechef'
  const requestingUserId = req.user?.userId ?? req.user?._id;

  // Build where clause based on filter + requesting user's profile
  let whereClause = {};
  let requestingUser = null;
  if (requestingUserId) {
    requestingUser = await prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { college: true, branch: true, year: true },
    });
  }

  if (filter && requestingUser) {
    if (filter === "college" && requestingUser.college) {
      whereClause.college = requestingUser.college;
    } else if (filter === "branch" && requestingUser.branch) {
      whereClause.branch = requestingUser.branch;
    } else if (filter === "year" && requestingUser.year) {
      whereClause.year = requestingUser.year;
    }
  }

  const platformKey = PLATFORM_SORT_MAP[sortBy]; // undefined when sortBy is 'all' or absent

  if (platformKey) {
    // Fetch users with their platform connections so we can sort by platform rating in JS
    const allUsers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        userName: true,
        avatarUrl: true,
        branch: true,
        year: true,
        points: true,
        platformConnections: {
          where: { platform: platformKey },
          select: { rating: true },
          take: 1,
        },
      },
    });

    // Sort by the platform rating descending (users with no connection go to the bottom)
    // Use overall points as a tie-breaker if ratings are equal
    allUsers.sort((a, b) => {
      const ratingA = a.platformConnections[0]?.rating ?? -1;
      const ratingB = b.platformConnections[0]?.rating ?? -1;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      return (b.points ?? 0) - (a.points ?? 0);
    });

    const usersWithRank = allUsers.map((u, idx) => {
      const { platformConnections, ...rest } = u;
      return {
        ...rest,
        overallRank: idx + 1,
        displayValue: platformConnections[0]?.rating ?? null,
        displayLabel: `${sortBy} rating`,
      };
    });

    const paginatedUsers = usersWithRank.slice(skip, skip + take);
    return res.status(200).json({ users: paginatedUsers });
  }

  // Default: sort by overall points
  const allMatchedUsers = await prisma.user.findMany({
    where: whereClause,
    orderBy: [{ points: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      userName: true,
      avatarUrl: true,
      branch: true,
      year: true,
      points: true,
    },
  });

  const usersWithRank = allMatchedUsers.map((u, idx) => ({
    ...u,
    overallRank: idx + 1,
    displayValue: u.points,
    displayLabel: "points",
  }));

  const paginatedUsers = usersWithRank.slice(skip, skip + take);
  return res.status(200).json({ users: paginatedUsers });
};

export const getUserByUserName = async (req, res) => {
  const { userName } = req.params;

  const user = await prisma.user.findUnique({
    where: { userName },
    select: {
      id: true,
      name: true,
      userName: true,
      avatarUrl: true,
      college: true,
      branch: true,
      year: true,
      role: true,
      points: true,
      createdAt: true,
      platformConnections: {
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
        },
        orderBy: { platform: "asc" },
      },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  // Dynamically compute ranks via efficient COUNT queries
  const [overallRank, branchRank, yearRank] = await Promise.all([
    prisma.user.count({ where: { points: { gt: user.points } } }).then(n => n + 1),
    user.branch
      ? prisma.user.count({ where: { branch: user.branch, points: { gt: user.points } } }).then(n => n + 1)
      : Promise.resolve(null),
    user.year
      ? prisma.user.count({ where: { year: user.year, points: { gt: user.points } } }).then(n => n + 1)
      : Promise.resolve(null),
  ]);

  return res.status(200).json({
    user: { ...user, overallRank, branchRank, yearRank },
  });
};

export const updateMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user.userId ?? req.user._id;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { branch: true, branchChangesCount: true },
  });

  if (!currentUser) return res.status(404).json({ error: "User not found" });

  const updateData = { ...req.body };

  if (updateData.branch !== undefined && updateData.branch !== currentUser.branch) {
    if (currentUser.branch) {
      if (currentUser.branchChangesCount >= 1) {
        return res.status(400).json({ error: "Branch can only be changed once after onboarding." });
      }
      updateData.branchChangesCount = { increment: 1 };
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      userName: true,
      email: true,
      avatarUrl: true,
      college: true,
      branch: true,
      year: true,
      role: true,
      points: true,
      overallRank: true,
      branchChangesCount: true,
      updatedAt: true,
    },
  });

  const enriched = await enrichUserWithRanks(updated);
  return res.status(200).json({ user: enriched });
};
