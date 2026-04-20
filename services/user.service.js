import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import { getSignedKey } from "../utils/auth.js";

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
  };
}

export async function signupUserAccount({ name, email, password }) {
  if (!name || !email || !password) {
    throw createError("Name, email, and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  return {
    token: getSignedKey(user._id, "user"),
    user: sanitizeUser(user),
    message: "Account created successfully",
  };
}

export async function loginUserAccount({ email, password }) {
  if (!email || !password) {
    throw createError("Email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw createError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw createError("Invalid password", 400);
  }

  return {
    token: getSignedKey(user._id, "user"),
    user: sanitizeUser(user),
    message: "Login successful",
  };
}

export function logoutUserAccount() {
  return {
    message: "Logged out successfully",
  };
}

//Admin services
export const getAllUsers = async () => {
  const allUsers = await User.find({});

  if (allUsers.length === 0) {
    throw createError("No users available", 404);
  }

  return {
    message: "Users found",
    users: allUsers.map(sanitizeUser),
  };
};

export const addNewUser = async ({ name, email, password, status }) => {
  if (!name || !email || !password) {
    throw createError("Name, email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const prevUser = await User.findOne({ email: normalizedEmail });
  if (prevUser) {
    throw createError("Email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    status: typeof status === "boolean" ? status : true,
  });

  return {
    message: "User successfully created",
    user: sanitizeUser(user),
  };
};

export const getUserById = async ({ id }) => {
  if (!id) {
    throw createError("Please select a user", 400);
  }

  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid user id", 400);
  }

  const user = await User.findOne({ _id: id });
  if (!user) {
    throw createError("User not found", 404);
  }

  return {
    message: "User found",
    user: sanitizeUser(user),
  };
};

export const deleteUserById = async ({ id }) => {
  if (!id) {
    throw createError("Please select a user", 400);
  }

  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid user id", 400);
  }

  const result = await User.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw createError("User not found", 404);
  }

  return {
    message: "User deleted successfully",
  };
}

export const updateUserById = async (id, data) => {
  if (!id || !data) {
    throw createError("Please fill all fields", 400);
  }

  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid user id", 400);
  }

  const allowedFields = ["name", "email", "status"];

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

  if (Object.keys(filteredData).length === 0) {
    throw createError("No valid fields provided for update", 400);
  }

  if (filteredData.email) {
    const existingUser = await User.findOne({
      email: filteredData.email,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw createError("Email already exists", 400);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(id, filteredData, {
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
