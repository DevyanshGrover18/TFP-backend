import {
  ADMIN_COOKIE_NAME,
  getCookieOptions,
} from "../utils/auth.js";
import {
  createAdminAccount,
  loginAdminAccount,
  logoutAdminAccount,
} from "../services/adminAuth.service.js";

export const createAdmin = async (req, res, next) => {
  try {
    const { token, message } = await createAdminAccount(req.body ?? {});
    res.cookie(ADMIN_COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { token, message } = await loginAdminAccount(req.body ?? {});
    res.cookie(ADMIN_COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = (req, res, next) => {
  try {
    const { message } = logoutAdminAccount();
    res.clearCookie(ADMIN_COOKIE_NAME, getCookieOptions());
    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};
