import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { storeImage } from "./image.service.js";
import { randomUUID } from "crypto";

const productProjection = {
  productId: 1,
  sku: 1,
  name: 1,
  colorCode: 1,
  categoryId: 1,
  subCategoryId: 1,
  subSubCategoryId: 1,
  description: 1,
  specifications: 1,
  media: 1,
  variants: 1,
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
    const error = new Error(
      "Category, subcategory, and sub sub category are required",
    );
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

  if (
    rootCategory.level !== 1 ||
    subCategory.level !== 2 ||
    subSubCategory.level !== 3
  ) {
    const error = new Error(
      "Selected categories must be category, subcategory, and sub sub category",
    );
    error.statusCode = 400;
    throw error;
  }

  if (String(subCategory.parentId) !== String(rootCategory._id)) {
    const error = new Error("Subcategory must belong to the selected category");
    error.statusCode = 400;
    throw error;
  }

  if (String(subSubCategory.parentId) !== String(subCategory._id)) {
    const error = new Error(
      "Sub sub category must belong to the selected subcategory",
    );
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

async function storeGalleryImages(images, folder, message) {
  if (!Array.isArray(images)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  const normalized = images
    .map((image) => (typeof image === "string" ? image.trim() : ""))
    .filter(Boolean);

  return Promise.all(normalized.map((image) => storeImage(image, folder)));
}

async function normalizeSpecifications(specifications) {
  if (!Array.isArray(specifications)) {
    const error = new Error("Specifications must be a list");
    error.statusCode = 400;
    throw error;
  }

  return specifications.map((specification, index) => {
    const key =
      typeof specification?.key === "string" ? specification.key.trim() : "";
    const value =
      typeof specification?.value === "string"
        ? specification.value.trim()
        : "";

    if (!key || !value) {
      const error = new Error(
        `Specification ${index + 1} must include both key and value`,
      );
      error.statusCode = 400;
      throw error;
    }

    return { key, value };
  });
}

async function normalizeVariants(variants) {
  if (!Array.isArray(variants)) {
    const error = new Error("Variants must be a list");
    error.statusCode = 400;
    throw error;
  }

  if (!variants.length) {
    return [];
  }

  return Promise.all(
    variants.map(async (variant, index) => {
      const sku = await requireStringField(
        variant?.sku,
        `Variant ${index + 1} sku is required`,
      );
      const name = await requireStringField(
        variant?.name,
        `Variant ${index + 1} name is required`,
      );
      const color = await requireStringField(
        variant?.color,
        `Variant ${index + 1} color is required`,
      );
      const colorCode = await requireStringField(
        variant?.colorCode,
        `Variant ${index + 1} color code is required`,
      );
      const mainImage = await requireStringField(
        variant?.mainImage,
        `Variant ${index + 1} main image is required`,
      );
      const storedMainImage = await storeImage(
        mainImage,
        "thefabricpeople/products/variants",
      );
      const gallery = await storeGalleryImages(
        variant?.gallery ?? [],
        "thefabricpeople/products/variants",
        `Variant ${index + 1} gallery must be a list of images`,
      );

      return {
        id: randomUUID(),
        sku,
        name,
        color,
        colorCode,
        mainImage: storedMainImage,
        gallery,
      };
    }),
  );
}

async function normalizeProductPayload(payload) {
  const sku = await requireStringField(
    payload?.sku,
    "SKU / Article Number is required",
  );
  const name = await requireStringField(
    payload?.name,
    "Product name is required",
  );
  const colorCode = await requireStringField(
    payload?.colorCode,
    "Color code is required",
  );
  const description = await requireStringField(
    payload?.description,
    "Description is required",
  );

  const { rootCategory, subCategory, subSubCategory } =
    await resolveCategoryChain({
      categoryId: payload?.categoryId,
      subCategoryId: payload?.subCategoryId,
      subSubCategoryId: payload?.subSubCategoryId,
    });

  const specifications = await normalizeSpecifications(
    payload?.specifications ?? [],
  );
  const mediaMainImage = await requireStringField(
    payload?.media?.mainImage,
    "Main image is required",
  );
  const media = {
    mainImage: await storeImage(mediaMainImage, "thefabricpeople/products"),
    gallery: await storeGalleryImages(
      payload?.media?.gallery ?? [],
      "thefabricpeople/products",
      "Gallery must be a list of images",
    ),
  };
  const variants = await normalizeVariants(payload?.variants);

  return {
    sku,
    name,
    colorCode,
    description,
    categoryId: rootCategory._id,
    subCategoryId: subCategory._id,
    subSubCategoryId: subSubCategory._id,
    specifications,
    media,
    variants,
  };
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
  const normalizedPayload = await normalizeProductPayload(payload);
  const productId = await generateProductId();

  return Product.create({
    productId,
    ...normalizedPayload,
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

  const normalizedPayload = await normalizeProductPayload(payload);

  product.sku = normalizedPayload.sku;
  product.name = normalizedPayload.name;
  product.colorCode = normalizedPayload.colorCode;
  product.description = normalizedPayload.description;
  product.categoryId = normalizedPayload.categoryId;
  product.subCategoryId = normalizedPayload.subCategoryId;
  product.subSubCategoryId = normalizedPayload.subSubCategoryId;
  product.specifications = normalizedPayload.specifications;
  product.media = normalizedPayload.media;
  product.variants = normalizedPayload.variants;

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

export const getProductBySlug = async ({ slug }) => {
  if (!slug) {
    const error = new Error("Please select a product");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findOne({
    name: { $regex: `^${slug}$`, $options: "i" },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    message: "Product found",
    product,
  };
};
