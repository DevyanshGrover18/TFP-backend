import { Router } from "express";
import { createAdmin, adminLogin, adminLogout } from "../controllers/adminAuth.controller.js";

const router = Router();

router.post("/login", adminLogin);
router.post("/signup", createAdmin);
router.get("/logout", adminLogout);

export default router;
