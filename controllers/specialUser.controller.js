import {
  createSpecialUserService,
  deleteSpecialUserById,
  getAllSpecialUsersService,
  loginSpecialUserService,
  updateSpecialUserById,
} from "../services/specialUser.service.js";
import { USER_COOKIE_NAME, getCookieOptions } from "../utils/auth.js";

export const getAllSpecialUsers = async (req, res, next) => {
  try {
    const { users, message } = await getAllSpecialUsersService();
    res.status(200).json({
      success: true,
      users,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const createSpecialUser = async (req, res, next) => {
  try {
    const { name, email, password, allowedCategories, status } = req.body;
    if (!name || !email || !password || !allowedCategories) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const { user, message } = await createSpecialUserService({
      name,
      email,
      password,
      allowedCategories,
      status,
    });

    res.status(200).json({
      success: true,
      user,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const loginSpecialUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { token, user, message } = await loginSpecialUserService({
      email,
      password,
    });

    // Bug fix: Set the JWT as an httpOnly cookie so verifyUser middleware can
    // authenticate special users on protected routes (e.g. cart).
    res.cookie(USER_COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      user,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// Bug fix: AuthContext calls /special-users/logout — this handler clears the cookie.
export const logoutSpecialUser = (req, res, next) => {
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

export const deleteSpecialUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const { message } = await deleteSpecialUserById(id);
    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSpecialUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    if (!id || !data) {
      return res.status(400).json({
        success: false,
        message: "ID and data is required",
      });
    }

    const { message, user } = await updateSpecialUserById(id, data);

    res.status(200).json({
      success: true,
      message,
      user,
    });
  } catch (error) {
    next(error);
  }
};
