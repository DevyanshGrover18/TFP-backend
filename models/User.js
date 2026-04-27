import mongoose from "mongoose";

const categoryValueSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    name: { type: String, default: "" },
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
    category: {
      type: categoryValueSchema,
      default: () => ({ id: "", name: "" }),
    },
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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status : {
      type : Boolean,
      required : true,
      default : true
    },
    role : {
      type: String,
      default: "user",
    },
    quoteProfile: {
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
