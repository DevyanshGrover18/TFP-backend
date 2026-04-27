import { Router } from "express";
import { getStatsCard } from "../controllers/overview.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = Router();

router.get('/stats', verifyAdmin, getStatsCard)

export default router