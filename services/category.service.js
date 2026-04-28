import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { storeImage } from "./image.service.js";

const categoryProjection = {
  name: 1,
  image: 1,
  parentId: 1,
  level: 1,
  createdAt: 1,
  updatedAt: 1,
};

function buildCategoryTree(categories) {
  const byId = new Map();
  const roots = [];

  categories.forEach((category) => {
    byId.set(String(category._id), { ...category, children: [] }); // ← removed .toObject()
  });

  categories.forEach((category) => {
    const node = byId.get(String(category._id));
    const parentId = category.parentId ? String(category.parentId) : null;

    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
}

async function getDescendantIds(categoryId) {
  const children = await Category.find({ parentId: categoryId }, { _id: 1 }).lean();
  const descendantIds = [];

  for (const child of children) {
    descendantIds.push(child._id);
    const nestedIds = await getDescendantIds(child._id);
    descendantIds.push(...nestedIds);
  }

  return descendantIds;
}

export async function listCategories(parentId = null) {
  const filter = {};
  if (parentId !== null) {
    filter.parentId = parentId;
  }

  const categories = await Category.find(filter)
    .sort({ createdAt: 1 })
    .select(categoryProjection)
    .lean();

  // Count products for each category across all three levels
  const categoryIds = categories.map((c) => c._id);

  const counts = await Product.aggregate([
    {
      $match: {
        $or: [
          { categoryId: { $in: categoryIds } },
          { subCategoryId: { $in: categoryIds } },
          { subSubCategoryId: { $in: categoryIds } },
        ],
      },
    },
    {
      $project: {
        matchedIds: {
          $filter: {
            input: ["$categoryId", "$subCategoryId", "$subSubCategoryId"],
            as: "id",
            cond: { $in: ["$$id", categoryIds] },
          },
        },
      },
    },
    { $unwind: "$matchedIds" },
    {
      $group: {
        _id: "$matchedIds",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [String(c._id), c.count])
  );

  return categories.map((c) => ({
    ...c,
    productCount: countMap[String(c._id)] ?? 0,
  }));
}


export async function getCategoryTree() {
  const categories = await Category.find({}, categoryProjection)
    .sort({ createdAt: 1 })
    .lean();

  // Count products for all categories
  const categoryIds = categories.map((c) => c._id);

  const counts = await Product.aggregate([
    {
      $match: {
        $or: [
          { categoryId: { $in: categoryIds } },
          { subCategoryId: { $in: categoryIds } },
          { subSubCategoryId: { $in: categoryIds } },
        ],
      },
    },
    {
      $project: {
        matchedIds: {
          $filter: {
            input: ["$categoryId", "$subCategoryId", "$subSubCategoryId"],
            as: "id",
            cond: { $in: ["$$id", categoryIds] },
          },
        },
      },
    },
    { $unwind: "$matchedIds" },
    {
      $group: {
        _id: "$matchedIds",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [String(c._id), c.count])
  );

  // Attach productCount before building tree
  const categoriesWithCount = categories.map((c) => ({
    ...c,
    productCount: countMap[String(c._id)] ?? 0,
  }));

  return buildCategoryTree(categoriesWithCount);
}

export async function getCategoryById(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid category id");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id).select(categoryProjection);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
}

export async function createCategory({ name, image, parentId = null }) {
  if (!name || !image) {
    const error = new Error("Name and image are required");
    error.statusCode = 400;
    throw error;
  }

  let level = 1;
  let normalizedParentId = null;

  if (parentId) {
    if (!mongoose.isValidObjectId(parentId)) {
      const error = new Error("Invalid parent category");
      error.statusCode = 400;
      throw error;
    }

    const parentCategory = await Category.findById(parentId);

    if (!parentCategory) {
      const error = new Error("Parent category not found");
      error.statusCode = 404;
      throw error;
    }

    if (parentCategory.level >= 3) {
      const error = new Error("Sub sub categories cannot have children");
      error.statusCode = 400;
      throw error;
    }

    level = parentCategory.level + 1;
    normalizedParentId = parentCategory._id;
  }

  const storedImage = await storeImage(image, "thefabricpeople/categories");

  return Category.create({
    name,
    image: storedImage,
    parentId: normalizedParentId,
    level,
  });
}

export async function updateCategory(id, { name, image }) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid category id");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (typeof name === "string" && name.trim()) {
    category.name = name.trim();
  }

  if (typeof image === "string" && image.trim()) {
    category.image = await storeImage(image, "thefabricpeople/categories");
  }

  await category.save();
  return category;
}

export async function deleteCategory(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid category id");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const descendantIds = await getDescendantIds(category._id);
  const idsToDelete = [category._id, ...descendantIds];

  await Category.deleteMany({ _id: { $in: idsToDelete } });

  return {
    deletedIds: idsToDelete,
  };
}
