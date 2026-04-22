import mongoose from "mongoose";

const orderVariantSchema = new mongoose.Schema(
  {
    sku: { type: String, default: "" },
    name: { type: String, default: "" },
    color: { type: String, default: "" },
    colorCode: { type: String, default: "" },
  },
  { _id: false },
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    colorCode: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    variant: {
      type: orderVariantSchema,
      default: null,
    },
  },
  { _id: false },
);

const invoiceAddressSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "" },
    street: { type: String, default: "" },
    nr: { type: String, default: "" },
    apartment: { type: String, default: "" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
    notLiableForVat: { type: Boolean, default: false },
    vatNumber: { type: String, default: "" },
    chamberOfCommerce: { type: String, default: "" },
    category: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    sameAsInvoice: { type: Boolean, default: false },
    companyName: { type: String, default: "" },
    street: { type: String, default: "" },
    nr: { type: String, default: "" },
    apartment: { type: String, default: "" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false },
);

const quoteDetailsSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, default: "" },
    emailInvoice: { type: String, default: "" },
    mobileCode: { type: String, default: "" },
    mobile: { type: String, default: "" },
    phoneCode: { type: String, default: "" },
    phone: { type: String, default: "" },
    acceptUpdates: { type: Boolean, default: false },
    acceptTerms: { type: Boolean, default: false },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },
    profile: {
      invoice: {
        type: invoiceAddressSchema,
        default: () => ({}),
      },
      shipping: {
        type: shippingAddressSchema,
        default: () => ({}),
      },
      details: {
        type: quoteDetailsSchema,
        default: () => ({}),
      },
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
