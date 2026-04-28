import { Router } from "express";
import verifyAdmin from "../middleware/verifyAdmin.js";
import {
  createSpecialUser,
  deleteSpecialUser,
  getAllSpecialUsers,
  loginSpecialUser,
  logoutSpecialUser,
  updateSpecialUser,
} from "../controllers/specialUser.controller.js";

const router = Router();

router.get("/all", verifyAdmin, getAllSpecialUsers);
router.post("/create", verifyAdmin, createSpecialUser);
router.post("/login", loginSpecialUser);
// Bug fix: AuthContext calls GET /special-users/logout — route was missing
router.get("/logout", logoutSpecialUser);
router.delete("/:id", verifyAdmin, deleteSpecialUser);
router.patch("/:id", verifyAdmin, updateSpecialUser);

export default router;
