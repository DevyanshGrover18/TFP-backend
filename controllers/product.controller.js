import {
  createProduct,
  createProductFilters,
  deleteProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  updateProduct,
} from "../services/product.service.js";
import { createSignedUploadConfig } from "../services/image.service.js";

export async function getProducts(_req, res, next) {
  try {
    const products = await listProducts();
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
}

export async function createProductController(req, res, next) {
  try {
    const product = await createProduct(req.body ?? {});
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
}

export async function updateProductController(req, res, next) {
  try {
    const product = await updateProduct(req.params.id, req.body ?? {});
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProductController(req, res, next) {
  try {
    const result = await deleteProduct(req.params.id);
    return res.json({
      message: "Product deleted",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProductUploadSignatureController(req, res, next) {
  try {
    const folder =
      typeof req.body?.folder === "string" && req.body.folder.trim()
        ? req.body.folder.trim()
        : "thefabricpeople/products";

    const upload = createSignedUploadConfig(folder);
    return res.json({ upload });
  } catch (error) {
    return next(error);
  }
}

export const getProductByName = async(req, res, next)=>{
  const {slug} = req.params;
  console.log("hit")
  const {message , product} = await getProductBySlug({slug});
  res.status(200).json({
    success : true,
    message, 
    product
  })
}

export const getProductFilters = async (req, res, next)=>{
  const {message, filters} = await createProductFilters()
  res.status(200).json({
    success: true,
    message,
    filters
  })
}