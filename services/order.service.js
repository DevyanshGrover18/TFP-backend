import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import SpecialUser from "../models/SpecialUser.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeCategoryValue(category) {
  if (typeof category === "string") {
    return { id: "", name: category.trim() };
  }

  return {
    id: String(category?.id ?? "").trim(),
    name: String(category?.name ?? "").trim(),
  };
}

function normalizeOrderProfile(profile) {
  return {
    ...profile,
    invoice: {
      ...profile?.invoice,
      category: normalizeCategoryValue(profile?.invoice?.category),
    },
  };
}

const sanitizeOrder = (order) => {
  const user = typeof order.userId === "object" && order.userId !== null
    ? order.userId
    : null;

  return {
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    userId: user?._id ?? order.userId,
    userRole: user?.userType ?? null,
    customerName: `${order.profile?.details?.firstName ?? ""} ${order.profile?.details?.lastName ?? ""}`.trim(),
    companyName: order.profile?.invoice?.companyName ?? "",
    email: order.profile?.details?.email ?? "",
    mobile: `${order.profile?.details?.mobileCode ?? ""} ${order.profile?.details?.mobile ?? ""}`.trim(),
    itemCount: order.items?.length ?? 0,
    profile: order.profile,
    items: order.items,
    fields: order.fields,
  };
};

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

  const [regularUser, specialUser, cart] = await Promise.all([
    User.findById(userId),
    SpecialUser.findById(userId),
    Cart.findOne({ userId }).populate("items.productId"),
  ]);

  const user = regularUser || specialUser;

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
    profile: normalizeOrderProfile(user.quoteProfile),
    items,
  });

  return {
    message: "Quote request created successfully",
    order: sanitizeOrder(order),
  };
}

export async function getAllOrders() {
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

  const ordersWithUsers = await Promise.all(
    orders.map(async (order) => {
      const [user, specialUser] = await Promise.all([
        User.findById(order.userId).lean(),
        SpecialUser.findById(order.userId).lean(),
      ]);

      const foundUser = user ?? specialUser;
      const userType = user ? "user" : specialUser ? "special" : null;

      return sanitizeOrder({
        ...order,
        userId: foundUser
          ? { ...foundUser, userType }
          : order.userId,
      });
    }),
  );

  return {
    message: "Orders fetched successfully",
    orders: ordersWithUsers,
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

export const updateOrderStatusById = async ({ id, status, fields }) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid Order Id", 400);
  }

  const allowedStatus = ["Pending", "Processing", "Completed", "Cancelled"];

  if (status && !allowedStatus.includes(status)) {
    throw createError("Invalid status", 400);
  }

  // Build update object dynamically
  const updateData = {};

  if (status) {
    updateData.status = status;
  }

  if (fields && Array.isArray(fields)) {
    const isValid = fields.every(
      (f) => typeof f.key === "string" && typeof f.value === "string"
    );
    if (!isValid) {
      throw createError("Each field must have a string key and value", 400);
    }
    updateData.fields = fields;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError("No valid fields provided to update", 400);
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!order) {
    throw createError("Order not found", 404);
  }

  return {
    message: "Order updated successfully",
  };
};
