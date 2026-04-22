import { Router } from "express";
import verifyAdmin from "../middleware/verifyAdmin.js";
import {
  createSpecialUser,
  deleteSpecialUser,
  getAllSpecialUsers,
  loginSpecialUser,
  updateSpecialUser,
} from "../controllers/specialUser.controller.js";

const router = Router();

router.get("/all", verifyAdmin, getAllSpecialUsers);
router.post("/create", verifyAdmin, createSpecialUser);
router.post("/login", loginSpecialUser);
router.delete("/:id", verifyAdmin, deleteSpecialUser);
router.patch("/:id", verifyAdmin, updateSpecialUser);

export default router;
