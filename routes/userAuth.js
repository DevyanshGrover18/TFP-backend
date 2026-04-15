import { Router } from "express";
import {
  loginUser,
  logoutUser,
  signupUser,
} from "../controllers/userAuthController.js";

const router = Router();

router.post("/login", loginUser);
router.post("/signup", signupUser);
router.get("/logout", logoutUser);

export default router;
