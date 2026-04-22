import SpecialUser from "../models/SpecialUser.js";
import bcrypt from "bcrypt";
import { getSignedKey } from "../utils/auth.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import mongoose from "mongoose";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    status: user.status,
    allowedCategories: Array.isArray(user.allowedCategories)
      ? user.allowedCategories.map((categoryId) => categoryId.toString())
      : [],
  };
}

export const getAllSpecialUsersService = async () => {
  const allUsers = await SpecialUser.find({});

  return {
    message: "Users found",
    users: allUsers.map(sanitizeUser),
  };
};

export const createSpecialUserService = async ({
  name,
  email,
  password,
  allowedCategories,
  status,
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const prevUser = await SpecialUser.findOne({ email: normalizedEmail });
  if (prevUser) {
    throw createError("Email already exists", 400);
  }

  const user = await SpecialUser.create({
    name: name.trim(),
    email: normalizedEmail,
    password: encrypt(password),
    allowedCategories,
    status,
  });

  return {
    token: getSignedKey(user._id, "specialUser"),
    user: sanitizeUser(user),
    message: "Special User Created Successfuly",
  };
};

export const loginSpecialUserService = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await SpecialUser.findOne({ email: normalizedEmail });

  if (!user) {
    throw createError("User does not exist", 404);
  }

  if (user.role !== "special") {
    throw createError("You are not allowed to access this", 403);
  }

  if (!user.status) {
    throw createError("Account is disabled", 403);
  }

  const plainPassword = decrypt(user.password);
  if (plainPassword !== password) {
    throw createError("Incorrect password", 400);
  }

  return {
    token: getSignedKey(user._id, "specialUser"),
    user: sanitizeUser(user),
    message: "Log in successful",
  };
};

export const deleteSpecialUserById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid user id", 400);
  }

  const deletedUser = await SpecialUser.findByIdAndDelete(id);

  if (!deletedUser) {
    throw createError("User not found", 404);
  }

  return {
    message: "User deleted successfully",
  };
};

export const updateSpecialUserById = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid user id", 400);
  }

  const allowedFields = [
    "name",
    "email",
    "password",
    "allowedCategories",
    "status",
  ];

  const filteredData = Object.keys(data)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  if (typeof filteredData.name === "string") {
    filteredData.name = filteredData.name.trim();
  }
  if (typeof filteredData.email === "string") {
    filteredData.email = filteredData.email.trim().toLowerCase();
  }
  if (
    typeof filteredData.password === "string" &&
    filteredData.password.length > 0
  ) {
    filteredData.password = encrypt(filteredData.password);
  } else {
    delete filteredData.password;
  }

  if (Object.keys(filteredData).length === 0) {
    throw createError("No valid fields provided for update", 400);
  }

  if (filteredData.email) {
    const existingUser = await SpecialUser.findOne({
      email: filteredData.email,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw createError("Email already exists", 400);
    }
  }

  const updatedUser = await SpecialUser.findByIdAndUpdate(id, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw createError("User not found", 404);
  }

  return {
    message: "User updated successfully",
    user: sanitizeUser(updatedUser),
  };
};
