import {
  addImages,
  deleteImageById,
  getAllImages,
} from "../services/homepage.service.js";

export const getImages = async (req, res, next) => {
  try {
    const { success, message, images } = await getAllImages();
    if (!success) {
      return res.status(404).json({
        success,
        message,
      });
    }
    res.status(200).json({
      success,
      images,
    });
  } catch (error) {
    next(error);
  }
};

export const addNewImages = async (req, res, next) => {
  try {
    const { images } = req.body;
    if (!images || images.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Please add images",
      });
    }

    if (images.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Max 5 images are allowed",
      });
    }

    const { success, message } = await addImages(images);

    res.status(200).json({
      success,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }

    const { success, message } = await deleteImageById(id);

    if (!success) {
      return res.status(404).json({
        success,
        message,
      });
    }

    res.status(200).json({
      success,
      message,
    });
  } catch (error) {
    next(error);
  }
};
