import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import {
  ADMIN_COOKIE_NAME,
  getCookieOptions,
  getSignedKey,
} from "../utils/auth.js";

export const createAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({
        success: false,
        message: "Admin Already Exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newAdmin = await Admin.create({
      username: username,
      password: hashedPassword,
    });

    const jwtToken = getSignedKey(newAdmin._id, "admin");

    res.cookie(ADMIN_COOKIE_NAME, jwtToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: "Admin Created",
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const jwtToken = getSignedKey(admin._id, "admin");

    res.cookie(ADMIN_COOKIE_NAME, jwtToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login Successful",
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = (req, res, next) => {
  try {
    res.clearCookie(ADMIN_COOKIE_NAME, getCookieOptions());
    res.status(200).json({
      success: true,
      message: "Logged out Sucessfully",
    });
  } catch (error) {
    next(error);
  }
};
