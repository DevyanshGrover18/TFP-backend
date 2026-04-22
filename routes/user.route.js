import { Router } from "express";
import {
  createAdminUser,
  deleteAdminUser,
  getCurrentUserProfile,
  getAdminUSerById,
  getAll,
  loginUser,
  logoutUser,
  signupUser,
  updateCurrentUserProfile,
  updateAdminUser,
} from "../controllers/user.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyUser from "../middleware/verifyUser.js";

const router = Router();

router.post("/auth/login", loginUser);
router.post("/auth/signup", signupUser);
router.get("/auth/logout", logoutUser);
router
  .route("/profile")
  .get(verifyUser, getCurrentUserProfile)
  .put(verifyUser, updateCurrentUserProfile);

//admin routes
router.route("/").get(verifyAdmin, getAll).post(verifyAdmin, createAdminUser);
router
  .route("/:id")
  .get(verifyAdmin, getAdminUSerById)
  .delete(verifyAdmin, deleteAdminUser)
  .put(verifyAdmin, updateAdminUser);

export default router;
