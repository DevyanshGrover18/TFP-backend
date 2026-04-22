import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizeOrder(order) {
  const customerName = `${order.profile?.details?.firstName ?? ""} ${
    order.profile?.details?.lastName ?? ""
  }`.trim();

  return {
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    userId: order.userId,
    customerName,
    companyName: order.profile?.invoice?.companyName ?? "",
    email: order.profile?.details?.email ?? "",
    mobile: `${order.profile?.details?.mobileCode ?? ""} ${
      order.profile?.details?.mobile ?? ""
    }`.trim(),
    itemCount: order.items?.length ?? 0,
    profile: order.profile,
    items: order.items ?? [],
  };
}

function buildOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `Q-${timestamp}-${random}`;
}

async function createUniqueOrderNumber() {
  let orderNumber = buildOrderNumber();

  while (await Order.exists({ orderNumber })) {
    orderNumber = buildOrderNumber();
  }

  return orderNumber;
}

export async function createOrderFromCart(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user id", 400);
  }

  const [user, cart] = await Promise.all([
    User.findById(userId),
    Cart.findOne({ userId }).populate("items.productId"),
  ]);

  if (!user) {
    throw createError("User not found", 404);
  }

  if (!cart || !cart.items.length) {
    throw createError("Cart is empty", 400);
  }

  const items = cart.items
    .map((item) => {
      const product = item.productId;

      if (!product) {
        return null;
      }

      const variant = item.variantId
        ? product.variants.find((entry) => entry.id === item.variantId)
        : null;

      return {
        productId: product._id,
        variantId: item.variantId ?? null,
        quantity: item.quantity ?? 1,
        name: product.name,
        sku: product.sku,
        colorCode: product.colorCode,
        description: product.description,
        image: variant?.mainImage || product.media?.mainImage || "",
        variant: variant
          ? {
              sku: variant.sku ?? "",
              name: variant.name,
              color: variant.color,
              colorCode: variant.colorCode,
            }
          : null,
      };
    })
    .filter(Boolean);

  if (!items.length) {
    throw createError("Cart items are invalid", 400);
  }

  const order = await Order.create({
    orderNumber: await createUniqueOrderNumber(),
    userId,
    status: "Pending",
    profile: user.quoteProfile,
    items,
  });

  return {
    message: "Quote request created successfully",
    order: sanitizeOrder(order),
  };
}

export async function getAllOrders() {
  const orders = await Order.find({}).sort({ createdAt: -1 });

  return {
    message: "Orders fetched successfully",
    orders: orders.map(sanitizeOrder),
  };
}

export async function getOrdersByUserId(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user id", 400);
  }

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  return {
    message: "Orders fetched successfully",
    orders: orders.map(sanitizeOrder),
  };
}

export async function getOrderById(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid order id", 400);
  }

  const order = await Order.findById(id);

  if (!order) {
    throw createError("Order not found", 404);
  }

  return {
    message: "Order fetched successfully",
    order: sanitizeOrder(order),
  };
}
