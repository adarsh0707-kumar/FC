import { Router } from "express";
import {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authGuard } from "../middleware/authGuard.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

// Slows password guessing without locking a legitimate admin out for long.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again in a few minutes.",
});

// Tighter: each request sends an email, so this is also anti-spam.
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Please try again later.",
});

// Public
router.post("/login", loginLimiter, login);
router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetLimiter, resetPassword);

// Admin only
router.post("/change-password", authGuard, changePassword);

export default router;
