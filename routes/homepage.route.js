import { Router } from "express";
import { addNewImages, deleteImage, getImages } from "../controllers/homepage.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = Router();

router.get("/", getImages)
router.post("/", verifyAdmin, addNewImages);
router.delete("/:id", verifyAdmin, deleteImage)

export default router;