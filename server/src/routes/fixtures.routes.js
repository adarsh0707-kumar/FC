import { Router } from "express";
import {
  getFixtures,
  createFixture,
  updateFixture,
  deleteFixture,
} from "../controllers/fixtures.controller.js";
import { recordResult } from "../controllers/results.controller.js";
import { authGuard } from "../middleware/authGuard.js";

const router = Router();

// Public
router.get("/", getFixtures);

// Admin only
router.post("/", authGuard, createFixture);
router.put("/:id", authGuard, updateFixture);
router.delete("/:id", authGuard, deleteFixture);
router.post("/:id/result", authGuard, recordResult);

export default router;
