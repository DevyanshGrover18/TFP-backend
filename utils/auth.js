import jwt from "jsonwebtoken";

export const ADMIN_COOKIE_NAME = "adminToken";
export const USER_COOKIE_NAME = "userToken";

export const getSignedKey = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 24 * 60 * 60 * 1000,
});
