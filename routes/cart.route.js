import { Router } from "express";
import {
  addItemToCart,
  getAllItemsInCart,
  removeCartItem,
  updateCartItem,
  clearCart
} from "../controllers/cart.controller.js";
import verifyUser from "../middleware/verifyUser.js";


const router = Router();

router.get("/me", verifyUser, getAllItemsInCart);
router.post("/add", verifyUser, addItemToCart);
router.patch("/update", verifyUser, updateCartItem);
router.delete("/remove", verifyUser, removeCartItem);
router.delete("/clear", verifyUser, clearCart);

export default router;
