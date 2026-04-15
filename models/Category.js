import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
  },
  {
    timestamps: true,
  },
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
