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
import verifyUser from "../middleware/verifyUser.js";

const router = Router();

router.post("/", verifyUser, createOrder);
router.post("/send-mail", sendSuccessMail);
router.get("/me", verifyUser, getMyOrders);
router.get("/", verifyAdmin, getOrders);
router.get("/:id", verifyAdmin, getOrder);
router.post("/:id", verifyAdmin, updateOrderStatus);

export default router;
