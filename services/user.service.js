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

function sanitizeQuoteProfile(user) {
  return {
    invoice: {
      companyName: user.quoteProfile?.invoice?.companyName ?? "",
      street: user.quoteProfile?.invoice?.street ?? "",
      nr: user.quoteProfile?.invoice?.nr ?? "",
      apartment: user.quoteProfile?.invoice?.apartment ?? "",
      city: user.quoteProfile?.invoice?.city ?? "",
      zip: user.quoteProfile?.invoice?.zip ?? "",
      country: user.quoteProfile?.invoice?.country ?? "",
      notLiableForVat: user.quoteProfile?.invoice?.notLiableForVat ?? false,
      vatNumber: user.quoteProfile?.invoice?.vatNumber ?? "",
      chamberOfCommerce: user.quoteProfile?.invoice?.chamberOfCommerce ?? "",
      category: user.quoteProfile?.invoice?.category ?? "",
      website: user.quoteProfile?.invoice?.website ?? "",
    },
    shipping: {
      sameAsInvoice: user.quoteProfile?.shipping?.sameAsInvoice ?? false,
      companyName: user.quoteProfile?.shipping?.companyName ?? "",
      street: user.quoteProfile?.shipping?.street ?? "",
      nr: user.quoteProfile?.shipping?.nr ?? "",
      apartment: user.quoteProfile?.shipping?.apartment ?? "",
      city: user.quoteProfile?.shipping?.city ?? "",
      zip: user.quoteProfile?.shipping?.zip ?? "",
      country: user.quoteProfile?.shipping?.country ?? "",
    },
    details: {
      firstName: user.quoteProfile?.details?.firstName ?? "",
      lastName: user.quoteProfile?.details?.lastName ?? "",
      email: user.quoteProfile?.details?.email ?? user.email ?? "",
      emailInvoice: user.quoteProfile?.details?.emailInvoice ?? "",
      mobileCode: user.quoteProfile?.details?.mobileCode ?? "",
      mobile: user.quoteProfile?.details?.mobile ?? "",
      phoneCode: user.quoteProfile?.details?.phoneCode ?? "",
      phone: user.quoteProfile?.details?.phone ?? "",
      acceptUpdates: user.quoteProfile?.details?.acceptUpdates ?? false,
      acceptTerms: user.quoteProfile?.details?.acceptTerms ?? false,
    },
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

export async function getUserQuoteProfile(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user id", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return {
    message: "Profile loaded successfully",
    profile: sanitizeQuoteProfile(user),
  };
}

export async function updateUserQuoteProfile(userId, data) {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user id", 400);
  }

  if (!data?.invoice || !data?.shipping || !data?.details) {
    throw createError("Invoice, shipping, and details are required", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  const firstName = String(data.details.firstName ?? "").trim();
  const lastName = String(data.details.lastName ?? "").trim();
  const detailsEmail = String(data.details.email ?? "").trim().toLowerCase();

  if (detailsEmail && detailsEmail !== user.email) {
    const existingUser = await User.findOne({
      email: detailsEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw createError("Email already exists", 400);
    }
  }

  user.name = `${firstName} ${lastName}`.trim() || user.name;
  user.email = detailsEmail || user.email;
  user.quoteProfile = {
    invoice: {
      companyName: String(data.invoice.companyName ?? "").trim(),
      street: String(data.invoice.street ?? "").trim(),
      nr: String(data.invoice.nr ?? "").trim(),
      apartment: String(data.invoice.apartment ?? "").trim(),
      city: String(data.invoice.city ?? "").trim(),
      zip: String(data.invoice.zip ?? "").trim(),
      country: String(data.invoice.country ?? "").trim(),
      notLiableForVat: Boolean(data.invoice.notLiableForVat),
      vatNumber: String(data.invoice.vatNumber ?? "").trim(),
      chamberOfCommerce: String(data.invoice.chamberOfCommerce ?? "").trim(),
      category: String(data.invoice.category ?? "").trim(),
      website: String(data.invoice.website ?? "").trim(),
    },
    shipping: {
      sameAsInvoice: Boolean(data.shipping.sameAsInvoice),
      companyName: String(data.shipping.companyName ?? "").trim(),
      street: String(data.shipping.street ?? "").trim(),
      nr: String(data.shipping.nr ?? "").trim(),
      apartment: String(data.shipping.apartment ?? "").trim(),
      city: String(data.shipping.city ?? "").trim(),
      zip: String(data.shipping.zip ?? "").trim(),
      country: String(data.shipping.country ?? "").trim(),
    },
    details: {
      firstName,
      lastName,
      email: detailsEmail,
      emailInvoice: String(data.details.emailInvoice ?? "").trim(),
      mobileCode: String(data.details.mobileCode ?? "").trim(),
      mobile: String(data.details.mobile ?? "").trim(),
      phoneCode: String(data.details.phoneCode ?? "").trim(),
      phone: String(data.details.phone ?? "").trim(),
      acceptUpdates: Boolean(data.details.acceptUpdates),
      acceptTerms: Boolean(data.details.acceptTerms),
    },
  };

  await user.save();

  return {
    message: "Profile updated successfully",
    user: sanitizeUser(user),
    profile: sanitizeQuoteProfile(user),
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
