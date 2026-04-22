import {
  createOrderFromCart,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
} from "../services/order.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const { message, order } = await createOrderFromCart(req.user.id);

    res.status(201).json({
      success: true,
      message,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { message, orders } = await getAllOrders();

    res.status(200).json({
      success: true,
      message,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { message, orders } = await getOrdersByUserId(req.user.id);

    res.status(200).json({
      success: true,
      message,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { message, order } = await getOrderById(req.params.id);

    res.status(200).json({
      success: true,
      message,
      order,
    });
  } catch (error) {
    next(error);
  }
};
