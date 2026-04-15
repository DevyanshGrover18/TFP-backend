import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  USER_COOKIE_NAME,
  getCookieOptions,
  getSignedKey,
} from "../utils/auth.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

export const signupUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = getSignedKey(user._id, "user");
    res.cookie(USER_COOKIE_NAME, token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = getSignedKey(user._id, "user");
    res.cookie(USER_COOKIE_NAME, token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res, next) => {
  try {
    res.clearCookie(USER_COOKIE_NAME, getCookieOptions());
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
