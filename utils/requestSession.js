import jwt from "jsonwebtoken";
import SpecialUser from "../models/SpecialUser.js";
import { ADMIN_COOKIE_NAME, USER_COOKIE_NAME } from "./auth.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function resolveSpecialUserSession(decoded) {
  const specialUser = await SpecialUser.findById(decoded.id)
    .select({ _id: 1, status: 1, allowedCategories: 1 })
    .lean();

  if (!specialUser || !specialUser.status) {
    throw createError("Unauthorized", 401);
  }

  return {
    kind: "specialUser",
    id: String(specialUser._id),
    allowedCategories: (specialUser.allowedCategories ?? []).map((categoryId) =>
      String(categoryId),
    ),
  };
}

export async function resolveRequestSession(req, { required = false } = {}) {
  const adminToken = req.cookies?.[ADMIN_COOKIE_NAME];
  let hasInvalidToken = false;

  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

      if (decoded?.id && decoded?.role === "admin") {
        return {
          kind: "admin",
          id: String(decoded.id),
        };
      }
    } catch {
      hasInvalidToken = true;
    }
  }

  const userToken = req.cookies?.[USER_COOKIE_NAME];

  if (userToken) {
    try {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

      if (!decoded?.id) {
        throw createError("Unauthorized", 401);
      }

      if (decoded.role === "specialUser") {
        return resolveSpecialUserSession(decoded);
      }

      if (decoded.role === "user") {
        return {
          kind: "user",
          id: String(decoded.id),
        };
      }
    } catch {
      hasInvalidToken = true;
    }
  }

  if (required) {
    throw createError(hasInvalidToken ? "Unauthorized" : "Unauthorized", 401);
  }

  return {
    kind: "guest",
    id: null,
  };
}
