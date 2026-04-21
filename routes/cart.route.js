import { Router } from "express";
import {
  addItemToCart,
  getAllItemsInCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/:userId", getAllItemsInCart)
router.post("/add", addItemToCart);
router.patch("/update", updateCartItem);
router.delete("/remove", removeCartItem);

export default router;
