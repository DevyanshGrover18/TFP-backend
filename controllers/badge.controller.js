import {
  createBadge,
  deleteBadge,
  listBadges,
} from "../services/badge.service.js";

export async function getBadges(_req, res, next) {
  try {
    const { badges } = await listBadges();
    return res.json({ badges });
  } catch (error) {
    return next(error);
  }
}

export async function createBadgeController(req, res, next) {
  try {
    const { badge } = await createBadge(req.body ?? {});
    return res.status(201).json({ badge });
  } catch (error) {
    return next(error);
  }
}

export async function deleteBadgeController(req, res, next) {
  try {
    const result = await deleteBadge(req.params.id);
    return res.json({
      message: "Badge deleted",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}
