import {
  addItem,
  getAllItems,
  removeItem,
  updateItemQuantity,
} from "../services/cart.service.js";

export const getAllItemsInCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if(!userId){
        return res.status(400).json({
            success : false,
            message : "userId is required"
        })
    }
    const { items } = await getAllItems({ userId });

    res.status(200).json({
        success : true,
        items
    })

  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { productId, variantId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User and product are required",
      });
    }

    const { message } = await addItem({ userId, productId, variantId });

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { productId, variantId, quantity } = req.body;

    if (!userId || !productId || typeof quantity !== "number") {
      return res.status(400).json({
        success: false,
        message: "User, product and quantity are required",
      });
    }

    const { message } = await updateItemQuantity({
      userId,
      productId,
      variantId,
      quantity,
    });

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { productId, variantId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User and product are required",
      });
    }

    const { message } = await removeItem({ userId, productId, variantId });

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};
