import Badge from "../models/Badge.js";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const RESERVED_BADGE_NAMES = ["New", "Sold Out"];

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizeBadge(badge) {
  return {
    id: String(badge._id),
    name: badge.name,
  };
}

function isReservedBadgeName(name) {
  return RESERVED_BADGE_NAMES.some(
    (reservedName) => reservedName.toLowerCase() === name.trim().toLowerCase(),
  );
}

async function ensureReservedBadges() {
  await Promise.all(
    RESERVED_BADGE_NAMES.map((name) =>
      Badge.findOneAndUpdate(
        { name },
        { name },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );
}

export async function listBadges() {
  await ensureReservedBadges();
  const badges = await Badge.find({}).sort({ name: 1 });

  return {
    badges: badges.map(sanitizeBadge),
  };
}

export async function createBadge(payload) {
  const name =
    typeof payload?.name === "string" ? payload.name.trim() : "";

  if (!name) {
    throw createError("Badge name is required", 400);
  }

  if (isReservedBadgeName(name)) {
    throw createError("This badge already exists as a reserved badge", 400);
  }

  const existing = await Badge.findOne({
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });

  if (existing) {
    throw createError("Badge already exists", 400);
  }

  const badge = await Badge.create({ name });

  return {
    badge: sanitizeBadge(badge),
  };
}

export async function deleteBadge(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid badge id", 400);
  }

  const badge = await Badge.findById(id);

  if (!badge) {
    throw createError("Badge not found", 404);
  }

  const badgeName = badge.name;

  if (isReservedBadgeName(badgeName)) {
    throw createError("Reserved badges cannot be deleted", 400);
  }

  const result = await Badge.deleteOne({ _id: id });

  if (!result.deletedCount) {
    throw createError("Badge not found", 404);
  }

  await Product.updateMany(
    {},
    {
      $pull: { badges: badgeName },
      ...(badgeName === "New" ? { $set: { isNew: false } } : {}),
    },
  );

  return {
    deletedId: id,
  };
}
