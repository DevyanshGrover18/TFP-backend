import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getProduct,
  getProducts,
  updateProductController,
} from "../controllers/productController.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProductController);
router.put("/:id", updateProductController);
router.delete("/:id", deleteProductController);

export default router;
