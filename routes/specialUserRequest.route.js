import { Router } from "express";
import verifyAdmin from "../middleware/verifyAdmin.js";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} from "../controllers/specialUserRequest.controller.js";

const router = Router();

// Public — anyone can submit a request
router.post("/", createRequest);

// Admin-only — manage requests
router.get("/", verifyAdmin, getAllRequests);
router.get("/:id", verifyAdmin, getRequestById);
router.patch("/:id", verifyAdmin, updateRequestStatus);
router.delete("/:id", verifyAdmin, deleteRequest);

export default router;