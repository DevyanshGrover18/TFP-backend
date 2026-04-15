import jwt from "jsonwebtoken";
import { ADMIN_COOKIE_NAME } from "../utils/auth.js";

const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized session",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.clearCookie(ADMIN_COOKIE_NAME);

    return res.status(401).json({
      success: false,
      message: "Session Expired",
    });
  }
};

export default verifyAdmin;
