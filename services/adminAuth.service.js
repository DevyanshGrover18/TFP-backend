import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import { getSignedKey } from "../utils/auth.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function createAdminAccount({ username, password }) {
  const admin = await Admin.findOne({ username });

  if (admin) {
    throw createError("Admin Already Exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await Admin.create({
    username,
    password: hashedPassword,
  });

  return {
    token: getSignedKey(newAdmin._id, "admin"),
    message: "Admin Created",
  };
}

export async function loginAdminAccount({ username, password }) {
  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw createError("Admin not Found", 404);
  }

  const isMatch = await bcrypt.compare(password, admin.password);

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
