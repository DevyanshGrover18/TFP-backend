import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryTree,
  listCategories,
  updateCategory,
} from "../services/categoryService.js";

export async function getCategories(req, res, next) {
  try {
    const { parentId } = req.query;
    const normalizedParentId =
      typeof parentId === "string" ? (parentId === "null" ? null : parentId) : null;
    const categories = await listCategories(normalizedParentId);

    return res.json({ categories });
  } catch (error) {
    return next(error);
  }
}

export async function getCategoryTreeController(_req, res, next) {
  try {
    const categories = await getCategoryTree();
    return res.json({ categories });
  } catch (error) {
    return next(error);
  }
}

export async function getCategory(req, res, next) {
  try {
    const category = await getCategoryById(req.params.id);
    return res.json({ category });
  } catch (error) {
    return next(error);
  }
}

export async function createCategoryController(req, res, next) {
  try {
    const category = await createCategory(req.body ?? {});
    return res.status(201).json({ category });
  } catch (error) {
    return next(error);
  }
}

export async function updateCategoryController(req, res, next) {
  try {
    const category = await updateCategory(req.params.id, req.body ?? {});
    return res.json({ category });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCategoryController(req, res, next) {
  try {
    const result = await deleteCategory(req.params.id);
    return res.json({
      message: "Category deleted",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}
