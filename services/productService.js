import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { storeImage } from "./imageService.js";

const productProjection = {
  productId: 1,
  sku: 1,
  name: 1,
  image: 1,
  categoryId: 1,
  subCategoryId: 1,
  subSubCategoryId: 1,
  composition: 1,
  color: 1,
  width: 1,
  weight: 1,
  createdAt: 1,
  updatedAt: 1,
};

function getTodayPrefix() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

async function generateProductId() {
  const prefix = getTodayPrefix();
  const latestProduct = await Product.findOne({
    productId: new RegExp(`^${prefix}-`),
  })
    .sort({ productId: -1 })
    .select({ productId: 1 });

  const latestSequence = latestProduct
    ? Number(latestProduct.productId.split("-")[1] ?? 0)
    : 0;

  return `${prefix}-${String(latestSequence + 1).padStart(4, "0")}`;
}

async function resolveCategoryChain({
  categoryId,
  subCategoryId,
  subSubCategoryId,
}) {
  if (!categoryId || !subCategoryId || !subSubCategoryId) {
    const error = new Error("Category, subcategory, and sub sub category are required");
    error.statusCode = 400;
    throw error;
  }

  const ids = [categoryId, subCategoryId, subSubCategoryId];

  for (const id of ids) {
    if (!mongoose.isValidObjectId(id)) {
      const error = new Error("Invalid category selection");
      error.statusCode = 400;
      throw error;
    }
  }

  const [rootCategory, subCategory, subSubCategory] = await Promise.all([
    Category.findById(categoryId),
    Category.findById(subCategoryId),
    Category.findById(subSubCategoryId),
  ]);

  if (!rootCategory || !subCategory || !subSubCategory) {
    const error = new Error("One or more categories were not found");
    error.statusCode = 404;
    throw error;
  }

  if (rootCategory.level !== 1 || subCategory.level !== 2 || subSubCategory.level !== 3) {
    const error = new Error("Selected categories must be category, subcategory, and sub sub category");
    error.statusCode = 400;
    throw error;
  }

  if (String(subCategory.parentId) !== String(rootCategory._id)) {
    const error = new Error("Subcategory must belong to the selected category");
    error.statusCode = 400;
    throw error;
  }

  if (String(subSubCategory.parentId) !== String(subCategory._id)) {
    const error = new Error("Sub sub category must belong to the selected subcategory");
    error.statusCode = 400;
    throw error;
  }

  return {
    rootCategory,
    subCategory,
    subSubCategory,
  };
}

async function requireStringField(value, message) {
  if (typeof value !== "string" || !value.trim()) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return value.trim();
}

export async function listProducts() {
  return Product.find({})
    .sort({ createdAt: -1 })
    .populate([
      { path: "categoryId", select: "name" },
      { path: "subCategoryId", select: "name" },
      { path: "subSubCategoryId", select: "name" },
    ])
    .select(productProjection);
}

export async function getProductById(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid product id");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id)
    .populate([
      { path: "categoryId", select: "name" },
      { path: "subCategoryId", select: "name" },
      { path: "subSubCategoryId", select: "name" },
    ])
    .select(productProjection);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
}

export async function createProduct(payload) {
  const [sku, name, image, composition, color, width, weight] = await Promise.all([
    requireStringField(payload?.sku, "SKU is required"),
    requireStringField(payload?.name, "Name is required"),
    requireStringField(payload?.image, "Image is required"),
    requireStringField(payload?.composition, "Composition is required"),
    requireStringField(payload?.color, "Color is required"),
    requireStringField(payload?.width, "Width is required"),
    requireStringField(payload?.weight, "Weight is required"),
  ]);

  const { rootCategory, subCategory, subSubCategory } = await resolveCategoryChain({
    categoryId: payload?.categoryId,
    subCategoryId: payload?.subCategoryId,
    subSubCategoryId: payload?.subSubCategoryId,
  });
  const storedImage = await storeImage(image, "thefabricpeople/products");

  const productId = await generateProductId();

  return Product.create({
    productId,
    sku,
    name,
    image: storedImage,
    categoryId: rootCategory._id,
    subCategoryId: subCategory._id,
    subSubCategoryId: subSubCategory._id,
    composition,
    color,
    width,
    weight,
  });
}

export async function updateProduct(id, payload) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid product id");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const sku = await requireStringField(payload?.sku, "SKU is required");
  const name = await requireStringField(payload?.name, "Name is required");
  const image = await requireStringField(payload?.image, "Image is required");
  const composition = await requireStringField(payload?.composition, "Composition is required");
  const color = await requireStringField(payload?.color, "Color is required");
  const width = await requireStringField(payload?.width, "Width is required");
  const weight = await requireStringField(payload?.weight, "Weight is required");

  const { rootCategory, subCategory, subSubCategory } = await resolveCategoryChain({
    categoryId: payload?.categoryId,
    subCategoryId: payload?.subCategoryId,
    subSubCategoryId: payload?.subSubCategoryId,
  });
  const storedImage = await storeImage(image, "thefabricpeople/products");

  product.sku = sku;
  product.name = name;
  product.image = storedImage;
  product.categoryId = rootCategory._id;
  product.subCategoryId = subCategory._id;
  product.subSubCategoryId = subSubCategory._id;
  product.composition = composition;
  product.color = color;
  product.width = width;
  product.weight = weight;

  await product.save();
  return product;
}

export async function deleteProduct(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid product id");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  await Product.deleteOne({ _id: product._id });

  return {
    deletedId: product._id,
  };
}
