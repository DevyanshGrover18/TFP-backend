import jwt from "jsonwebtoken";
import { USER_COOKIE_NAME } from "../utils/auth.js";

export default function verifyUser(req, res, next) {
  try {
    const token = req.cookies?.[USER_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id || decoded.role !== "user") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
}
