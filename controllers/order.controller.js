import {
  createOrderFromCart,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatusById,
} from "../services/order.service.js";
import { sendResendMail } from "../services/sendEmail.service.js";


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
    const { startDate, endDate } = req.query;
    const { message, orders } = await getAllOrders({ startDate, endDate });

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
    const { message, order } = await getOrderById(req.params.id, req.session);

    res.status(200).json({
      success: true,
      message,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const sendSuccessMail = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    const { message } = await sendResendMail({
      orderId,
      requester: req.session,
    });

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, fields } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }

    const { message } = await updateOrderStatusById({ id, status, fields });
    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};
