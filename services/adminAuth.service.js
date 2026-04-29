import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import { getSignedKey } from "../utils/auth.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function createAdminAccount({ username, password, setupKey }) {
  const normalizedUsername =
    typeof username === "string" ? username.trim() : "";
  const normalizedPassword =
    typeof password === "string" ? password.trim() : "";

  if (!normalizedUsername || !normalizedPassword) {
    throw createError("Username and password are required", 400);
  }

  const normalizedSetupKey =
    typeof setupKey === "string" ? setupKey.trim() : "";
  const configuredSetupKey =
    typeof process.env.ADMIN_SETUP_KEY === "string"
      ? process.env.ADMIN_SETUP_KEY.trim()
      : "";

  if (!configuredSetupKey) {
    throw createError("Admin signup is disabled", 403);
  }

  if (normalizedSetupKey !== configuredSetupKey) {
    throw createError("Invalid admin setup key", 403);
  }

  const existingAdminCount = await Admin.countDocuments();
  if (existingAdminCount > 0) {
    throw createError("Admin signup is disabled", 403);
  }

  const admin = await Admin.findOne({ username: normalizedUsername });

  if (admin) {
    throw createError("Admin Already Exists", 400);
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
  const newAdmin = await Admin.create({
    username: normalizedUsername,
    password: hashedPassword,
  });

  return {
    token: getSignedKey(newAdmin._id, "admin"),
    message: "Admin Created",
  };
}

export async function loginAdminAccount({ username, password }) {
  const normalizedUsername =
    typeof username === "string" ? username.trim() : "";
  const normalizedPassword =
    typeof password === "string" ? password : "";

  if (!normalizedUsername || !normalizedPassword) {
    throw createError("Username and password are required", 400);
  }

  const admin = await Admin.findOne({ username: normalizedUsername });

  if (!admin) {
    throw createError("Admin not Found", 404);
  }

  const isMatch = await bcrypt.compare(normalizedPassword, admin.password);

  if (!isMatch) {
    throw createError("Invalid Password", 400);
  }

  return {
    token: getSignedKey(admin._id, "admin"),
    message: "Login Successful",
  };
}

export function logoutAdminAccount() {
  return {
    message: "Logged out Sucessfully",
  };
}
