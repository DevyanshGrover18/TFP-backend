import {
  createSpecialUserService,
  deleteSpecialUserById,
  getAllSpecialUsersService,
  loginSpecialUserService,
  updateSpecialUserById,
} from "../services/specialUser.service.js";

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
      return res.status(200).json({
        success: false,
        message: "All fields are required",
      });
    }

    const { token, user, message } = await createSpecialUserService({
      name,
      email,
      password,
      allowedCategories,
      status,
    });

    res.status(200).json({
      success: true,
      token,
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

    res.status(200).json({
      success: true,
      token,
      user,
      message,
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
