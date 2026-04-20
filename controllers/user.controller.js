import { USER_COOKIE_NAME, getCookieOptions } from "../utils/auth.js";
import {
  addNewUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  loginUserAccount,
  logoutUserAccount,
  signupUserAccount,
  updateUserById,
} from "../services/user.service.js";

//Auth Controller
export const signupUser = async (req, res, next) => {
  try {
    const { token, user, message } = await signupUserAccount(req.body ?? {});
    res.cookie(USER_COOKIE_NAME, token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { token, user, message } = await loginUserAccount(req.body ?? {});
    res.cookie(USER_COOKIE_NAME, token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res, next) => {
  try {
    const { message } = logoutUserAccount();
    res.clearCookie(USER_COOKIE_NAME, getCookieOptions());
    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

//Admin Controllers
export const getAll = async (req, res, next) => {
  try {
    const { message, users } = await getAllUsers();
    res.status(200).json({
      success: true,
      message,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    const { user, message } = await addNewUser(req.body ?? {});
    res.status(200).json({
      success: true,
      message,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUSerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, user } = await getUserById({ id });

    res.status(200).json({
      message,
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = await deleteUserById({ id });

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, user } = await updateUserById(id, req.body ?? {});

    res.status(200).json({
      success: true,
      message,
      user,
    });
  } catch (error) {
    next(error)
  }
};
