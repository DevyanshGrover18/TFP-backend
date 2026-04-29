import SpecialUser from "../models/SpecialUser.js";
import bcrypt from "bcrypt";
import { getSignedKey } from "../utils/auth.js";
import { decrypt } from "../utils/encryption.js";
import mongoose from "mongoose";
import User from "../models/User.js";

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
  if (!name || !email || !password) {
    throw createError("Name, email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [prevUser, regularUser] = await Promise.all([
    SpecialUser.findOne({ email: normalizedEmail }),
    User.findOne({ email: normalizedEmail }),
  ]);
  if (prevUser || regularUser) {
    throw createError("Email already exists", 400);
  }

  if (!Array.isArray(allowedCategories) || allowedCategories.length === 0) {
    throw createError("At least one category is required", 400);
  }

  const user = await SpecialUser.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
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

  const isBcryptHash =
    typeof user.password === "string" && user.password.startsWith("$2");
  let isMatch = false;

  if (isBcryptHash) {
    isMatch = await bcrypt.compare(password, user.password);
  } else {
    try {
      const plainPassword = decrypt(user.password);
      isMatch = plainPassword === password;

      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    } catch {
      isMatch = false;
    }
  }

  if (!isMatch) {
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
    filteredData.password = await bcrypt.hash(filteredData.password, 10);
  } else {
    delete filteredData.password;
  }

  if (Object.keys(filteredData).length === 0) {
    throw createError("No valid fields provided for update", 400);
  }

  if (filteredData.email) {
    const [existingUser, regularUser] = await Promise.all([
      SpecialUser.findOne({
        email: filteredData.email,
        _id: { $ne: id },
      }),
      User.findOne({ email: filteredData.email }),
    ]);

    if (existingUser || regularUser) {
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
