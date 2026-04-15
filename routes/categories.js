import { Router } from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getCategories,
  getCategory,
  getCategoryTreeController,
  updateCategoryController,
} from "../controllers/categoryController.js";
import verifyAdmin from '../middleware/verifyAdmin.js'

const router = Router();

router.get("/", getCategories);
router.get("/tree", getCategoryTreeController);
router.get("/:id", getCategory);
router.post("/", verifyAdmin, createCategoryController);
router.put("/:id", verifyAdmin, updateCategoryController);
router.delete("/:id", verifyAdmin, deleteCategoryController);

export default router;
