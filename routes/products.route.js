import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getProduct,
  getProductByName,
  getProductUploadSignatureController,
  getProducts,
  updateProductController,
} from "../controllers/product.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = Router();

router.get("/", getProducts);
router.post("/upload-signature", verifyAdmin, getProductUploadSignatureController);
// router.get("/:id", getProduct);
router.get("/:slug", getProductByName);
router.post("/", verifyAdmin, createProductController);
router.put("/:id", verifyAdmin, updateProductController);
router.delete("/:id", verifyAdmin, deleteProductController);

export default router;
