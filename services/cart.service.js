import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureUserAndProduct({ userId, productId, variantId }) {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user id", 400);
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw createError("Invalid product id", 400);
  }

  const [user, product] = await Promise.all([
    User.findById(userId),
    Product.findById(productId),
  ]);

  if (!user) {
    throw createError("User not found", 404);
  }

  if (!product) {
    throw createError("Product not found", 404);
  }

  if (variantId) {
    const variant = product.variants.find((item) => item.id === variantId);

    if (!variant) {
      throw createError("Variant not found", 404);
    }
  }

  return { product };
}

export const getAllItems = async ({ userId }) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart || !cart.items.length) {
    return {
      success: true,
      items: [],
      message: "Cart is empty",
    };
  }

  const enrichedItems = cart.items.map((item) => {
    const product = item.productId;
    if (!product) return null;

    let variant = null;

    if (item.variantId) {
      variant = product.variants.find((v) => v.id === item.variantId);
    }

    return {
      productId: product._id,
      variantId: item.variantId ?? null,

      name: product.name,
      sku: product.sku,
      colorCode: product.colorCode,
      description: product.description,

      image: variant?.mainImage || product.media?.mainImage,

      variant: variant
        ? {
            sku: variant.sku,
            name: variant.name,
            color: variant.color,
            colorCode: variant.colorCode,
          }
        : null,
    };
  });

  return {
    success: true,
    items: enrichedItems.filter(Boolean),
  };
};

export const addItem = async ({ productId, variantId, userId }) => {
  await ensureUserAndProduct({ userId, productId, variantId });

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ productId, variantId, quantity: 1 }],
    });

    return {
      message: "Item added to cart",
    };
  }

  const existingItem = cart.items.find(
    (item) =>
      item.productId.toString() === productId &&
      (item.variantId ?? null) === (variantId ?? null),
  );

  if (existingItem) {
    return {
      message: "Item already in cart",
    };
  }

  cart.items.push({ productId, variantId, quantity: 1 });

  await cart.save();

  return {
    message: "Item added to cart",
  };
};

export const updateItemQuantity = async ({
  userId,
  productId,
  variantId,
  quantity,
}) => {
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(productId)) {
    throw createError("Invalid cart item reference", 400);
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createError("Quantity must be at least 1", 400);
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  const item = cart.items.find(
    (cartItem) =>
      cartItem.productId.toString() === productId &&
      (cartItem.variantId ?? null) === (variantId ?? null),
  );

  if (!item) {
    throw createError("Cart item not found", 404);
  }

  item.quantity = quantity;
  await cart.save();

  return {
    message: "Cart updated",
  };
};

export const removeItem = async ({ userId, productId, variantId }) => {
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(productId)) {
    throw createError("Invalid cart item reference", 400);
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  const initialLength = cart.items.length;

  cart.items = cart.items.filter(
    (item) =>
      !(
        item.productId.toString() === productId &&
        (item.variantId ?? null) === (variantId ?? null)
      ),
  );

  if (cart.items.length === initialLength) {
    throw createError("Cart item not found", 404);
  }

  await cart.save();

  return {
    message: "Item removed from cart",
  };
};
