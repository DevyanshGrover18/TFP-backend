import { Router } from "express";
import {
  createOrder,
  getOrder,
  getOrders,
  getMyOrders,
  sendSuccessMail,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifySession from "../middleware/verifySession.js";
import verifyUser from "../middleware/verifyUser.js";

export const router = Router();

router.post("/", verifyUser, createOrder);
router.post("/send-mail", verifySession, sendSuccessMail);
router.get("/me", verifyUser, getMyOrders);
router.get("/", verifyAdmin, getOrders);
router.get("/:id", verifySession, getOrder);
router.patch("/:id", verifyAdmin, updateOrderStatus);

export default router;
