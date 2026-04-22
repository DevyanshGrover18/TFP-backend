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

export const sendSuccessMail = async (req, res, next) => {
  try {
    const { name, email, orderId } = req.body;
    if (!name || !email || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Name, email and order id are required",
      });
    }

    const { message } = await sendResendMail({ name, email, orderId });

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};


export const updateOrderStatus = async (req, res, next)=>{
  try {
    const {id} = req.params;
    const {status} = req.body
    if(!id || !status){
      return res.status(400).json({
        success : false,
        message : "Id and status are required"
      })
    }

    const {message} = await updateOrderStatusById({id, status});
    res.status(200).json({
      success : true,
      message
    })
  } catch (error) {
    next(error)
  }
}