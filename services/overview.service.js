import User from "../models/User.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildDateRangeFilter(startDate, endDate) {
  if (!startDate || !endDate) {
    throw createError("startDate and endDate are required", 400);
  }

  const start = new Date(`${startDate}T00:00:00.000`);
  const end = new Date(`${endDate}T23:59:59.999`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw createError("Invalid date range", 400);
  }

  if (start > end) {
    throw createError("startDate cannot be after endDate", 400);
  }

  return {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };
}

function sanitizeCustomerName(profile) {
  return `${profile?.details?.firstName ?? ""} ${profile?.details?.lastName ?? ""}`.trim();
}

export const getStatsCardData = async ({ startDate, endDate }) => {
  const createdAtFilter = buildDateRangeFilter(startDate, endDate);

  const [
    productCount,
    userCount,
    orderCount,
    categoriesCount,
    recentOrders,
    recentUsers,
    topProductsRaw,
    topCategoriesRaw,
  ] = await Promise.all([
    Product.countDocuments(createdAtFilter),
    User.countDocuments(createdAtFilter),
    Order.countDocuments(createdAtFilter),
    Category.countDocuments({ level: 1, ...createdAtFilter }),
    Order.find(createdAtFilter).sort({ createdAt: -1 }).limit(5).lean(),
    User.find(createdAtFilter).sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([
      { $match: createdAtFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          requests: { $sum: "$items.quantity" },
        },
      },
      { $sort: { requests: -1, name: 1 } },
      { $limit: 5 },
    ]),
    Product.aggregate([
      { $match: createdAtFilter },
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 5 },
    ]),
  ]);

  const topProductMax = topProductsRaw[0]?.requests ?? 0;
  const topProducts = topProductsRaw.map((product) => ({
    id: String(product._id),
    name: product.name,
    requests: product.requests,
    pct:
      topProductMax > 0 ? Math.round((product.requests / topProductMax) * 100) : 0,
  }));

  const categoryIds = topCategoriesRaw.map((category) => category._id);
  const categories = categoryIds.length
    ? await Category.find({ _id: { $in: categoryIds } }).select({ name: 1 }).lean()
    : [];
  const categoryNameMap = new Map(
    categories.map((category) => [String(category._id), category.name]),
  );
  const topCategoryTotal = topCategoriesRaw.reduce(
    (sum, category) => sum + category.count,
    0,
  );
  const topCategories = topCategoriesRaw.map((category) => ({
    name: categoryNameMap.get(String(category._id)) ?? "Unknown",
    count: category.count,
    pct: topCategoryTotal > 0 ? Math.round((category.count / topCategoryTotal) * 100) : 0,
  }));

  return {
    data: {
      stats: {
        productCount,
        userCount,
        orderCount,
        categoriesCount,
      },
      topProducts,
      topCategories,
      recentOrders: recentOrders.map((order) => ({
        id: String(order._id),
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        customerName: sanitizeCustomerName(order.profile),
        email: order.profile?.details?.email ?? "",
        itemCount: order.items?.length ?? 0,
      })),
      recentUsers: recentUsers.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
      })),
    },
  };
};
