import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prismaClient.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validatePassword } from "../utils/passwordPolicy.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const RESET_TOKEN_TTL_MINUTES = 30;

const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    },
  );

  res.json({ token, expiresIn: "2h" });
});

/**
 * POST /api/auth/change-password — authenticated.
 * Requires the current password, so a stolen-but-unexpired token alone can't
 * take over the account.
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new password are required" });
  }

  const policyError = validatePassword(newPassword);
  if (policyError) {
    return res.status(400).json({ error: policyError, field: "newPassword" });
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
  if (!admin) return res.status(404).json({ error: "Account not found" });

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return res
      .status(401)
      .json({ error: "Current password is incorrect", field: "currentPassword" });
  }

  if (await bcrypt.compare(newPassword, admin.passwordHash)) {
    return res.status(400).json({
      error: "New password must be different from the current one",
      field: "newPassword",
    });
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    }),
    // Any reset link already in an inbox should stop working once the owner has
    // demonstrably regained control of the account.
    prisma.passwordResetToken.deleteMany({ where: { adminUserId: admin.id } }),
  ]);

  res.json({ message: "Password updated" });
});

/**
 * POST /api/auth/forgot-password — public.
 * Always answers 200 with the same body whether or not the address exists, so the
 * endpoint can't be used to enumerate valid admin accounts.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required", field: "email" });
  }

  const genericResponse = {
    message:
      "If that email matches an admin account, a reset link is on its way.",
  };

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return res.json(genericResponse);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);

  await prisma.$transaction([
    // Only the newest link should be live at any time.
    prisma.passwordResetToken.deleteMany({ where: { adminUserId: admin.id } }),
    prisma.passwordResetToken.create({
      data: { tokenHash: hashToken(rawToken), adminUserId: admin.id, expiresAt },
    }),
  ]);

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const resetUrl = `${clientUrl}/admin/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail({
      to: admin.email,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
    });
  } catch (err) {
    // A mail outage shouldn't reveal that the address was valid, so the response
    // stays identical — but this must be loud in the logs.
    console.error("Failed to send password reset email:", err);
  }

  res.json(genericResponse);
});

/** POST /api/auth/reset-password — public, consumes a single-use token. */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  const policyError = validatePassword(newPassword);
  if (policyError) {
    return res.status(400).json({ error: policyError, field: "newPassword" });
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });

  const invalid = { error: "This reset link is invalid or has expired" };
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    return res.status(400).json(invalid);
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: record.adminUserId },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { adminUserId: record.adminUserId, usedAt: null },
    }),
  ]);

  res.json({ message: "Password updated. You can now log in." });
});
