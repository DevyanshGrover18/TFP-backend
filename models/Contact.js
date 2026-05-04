import mongoose, { model } from "mongoose";

const contactSchema = new mongoose.Schema({
  existingCustomer: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Contact", contactSchema);
