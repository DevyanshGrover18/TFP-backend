import { Router } from "express";
import {
  createEnquiry,
  deleteEnquiry,
  getAllEnquiries,
  getEnquiryById,
} from "../controllers/contact.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
const router = Router();

router.post("/", createEnquiry);
router.get("/", verifyAdmin, getAllEnquiries);
router.get("/:id", verifyAdmin, getEnquiryById);
router.delete("/:id", verifyAdmin, deleteEnquiry);


export default router;
