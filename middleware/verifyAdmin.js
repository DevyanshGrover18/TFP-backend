import jwt from "jsonwebtoken";

const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.token;

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
    res.clearCookie("token");

    return res.status(401).json({
      success: false,
      message: "Session Expired",
    });
  }
};

export default verifyAdmin;
