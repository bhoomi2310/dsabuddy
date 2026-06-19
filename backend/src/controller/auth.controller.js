import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  loginPostRequestBodySchema,
  signupPostRequestBodySchema,
} from "../validation/request.validation.js";
import { prisma } from "../config/prismaClient.js";
import { enrichUserWithRanks } from "./user.controller.js";

export const signup = async (req, res) => {
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body
  );

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }

  const { name, userName, email, password } = validationResult.data;

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const existingByUserName = await prisma.user.findUnique({
    where: { userName },
    select: { id: true },
  });

  if (existingByEmail || existingByUserName) {
    return res.status(400).json({ error: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      userName,
      email,
      passwordHash,
      salt,
    },
    select: {
      id: true,
      name: true,
      userName: true,
      email: true,
      avatarUrl: true,
      branch: true,
      year: true,
      points: true,
      overallRank: true,
      branchChangesCount: true,
      createdAt: true,
    },
  });

  const token = jwt.sign(
    {
      userId: user.id,
      _id: user.id, // backward-compat for old code paths
      email: user.email,
      userName: user.userName,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res
    .status(201)
    .json({ message: "User created successfully", user, token });
};

export const login = async (req, res) => {
  const validationResult = await loginPostRequestBodySchema.safeParseAsync(
    req.body
  );

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }

  const { identifier, password } = validationResult.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { userName: identifier },
      ],
    },
    select: {
      id: true,
      email: true,
      userName: true,
      passwordHash: true,
    },
  });

  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!existingUser.passwordHash) {
    return res
      .status(400)
      .json({ error: "Password login not available for this account" });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.passwordHash
  );

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = {
    userId: existingUser.id,
    _id: existingUser.id, // backward-compat for old code paths
    email: existingUser.email,
    userName: existingUser.userName,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  return res.status(200).json({ status: "success", token });
};

export const logoutUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = req.headers.authorization?.split(" ")[1];

    const expSeconds = req.user?.exp;
    const expiresAt =
      typeof expSeconds === "number"
        ? new Date(expSeconds * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.blacklistedToken.create({
      data: { token, expiresAt },
    });

    return res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.userId ?? req.user._id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      userName: true,
      email: true,
      avatarUrl: true,
      college: true,
      branch: true,
      year: true,
      points: true,
      overallRank: true,
      branchChangesCount: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const enriched = await enrichUserWithRanks(user);
  return res.status(200).json({ user: enriched });
};

export const updatePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters long" });
    }

    const userId = req.user.userId ?? req.user._id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.passwordHash) {
      return res
        .status(400)
        .json({ error: "Password update not available for this account" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      return res.status(400).json({
        error: "New password must be different from current password",
      });
    }

    const newSalt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, newSalt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        salt: newSalt,
      },
    });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({
      error: "Failed to update password",
    });
  }
};

