import { Router } from "express";
import { getResults } from "../controllers/results.controller.js";

const router = Router();

// Public
router.get("/", getResults);

export default router;
