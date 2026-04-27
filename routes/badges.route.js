import { Router } from "express";
import {
  createBadgeController,
  deleteBadgeController,
  getBadges,
} from "../controllers/badge.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = Router();

router.get("/", getBadges);
router.post("/", verifyAdmin, createBadgeController);
router.delete("/:id", verifyAdmin, deleteBadgeController);

export default router;
