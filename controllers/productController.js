import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/productService.js";

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
