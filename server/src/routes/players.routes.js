import { Router } from "express";
import {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/players.controller.js";
import { authGuard } from "../middleware/authGuard.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public
router.get("/", getPlayers);
router.get("/:id", getPlayer);

// Admin only
router.post("/", authGuard, upload.single("photo"), createPlayer);
router.put("/:id", authGuard, upload.single("photo"), updatePlayer);
router.delete("/:id", authGuard, deletePlayer);

export default router;
