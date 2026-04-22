import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const variantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: false,
      default: undefined, // prevents null being stored when field is absent
    },
    sku: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    colorCode: {
      type: String,
      required: true,
      trim: true,
    },
    mainImage: {
      type: String,
      required: true,
      trim: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    colorCode: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subSubCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    specifications: {
      type: [specificationSchema],
      default: [],
    },
    media: {
      mainImage: {
        type: String,
        required: true,
        trim: true,
      },
      gallery: {
        type: [String],
        default: [],
      },
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    isNew : {
      type : Boolean,
      default : false
    }
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
