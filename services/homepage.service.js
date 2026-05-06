import mongoose, { isValidObjectId } from "mongoose";
import Homepage from "../models/Homepage.js";

export const getAllImages = async () => {
  const homepage = await Homepage.findOne();
  if (!homepage || homepage.images.length < 1 ) {
    return {
      success: false,
      message: "No images found",
    };
  }

  return { success: true, images : homepage.images };
};

export const addImages = async (images) => {
  const imageDocs = images.map((url) => ({ url }));

  await Homepage.findOneAndUpdate(
    {},
    { $push: { images: { $each: imageDocs } } },
    { upsert: true, new: true },
  );

  return {
    success: true,
    message: "Images added successfully",
  };
};

export const deleteImageById = async (id) => {
  if (!isValidObjectId(id)) {
    return {
      success: false,
      message: "Invalid ID",
    };
  }
  const response = await Homepage.findOneAndUpdate(
    {},
    { $pull: { images: { _id: new mongoose.Types.ObjectId(id) } } },
    { new: true },
  );

  if (!response) {
    return {
      success: false,
      message: "Image not found",
    };
  }

  return {
    success: true,
    message: "Image deleted successfully",
  };
};

