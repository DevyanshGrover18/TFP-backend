import { isValidObjectId } from "mongoose";
import Contact from "../models/Contact.js";

export const createContactService = async (data) => {
  await Contact.create({
    existingCustomer: data.existingCustomer ?? false,
    name: data.name,
    companyName: data.companyName,
    email: data.email,
    phone: data.phone,
    reason: data.reason,
    message: data.message,
  });

  return {
    success: true,
    message: "Enquiry sent",
  };
};

export const getAllContactService = async () => {
  const contacts = await Contact.find({}).sort({ createdAt: -1 });
  return {
    success: true,
    contacts,
    message: contacts.length ? "Enquiries found" : "No enquiries found",
  };
};

export const getContactById = async ({ id }) => {
  if (!isValidObjectId(id)) {
    return {
      success: false,
      message: "ID is not valid",
    };
  }

  const contact = await Contact.findById(id);

  if (!contact) {
    return {
      success: false,
      message: "Enquiry not found",
    };
  }

  return {
    success: true,
    contact,
  };
};

export const deleteContact = async ({ id }) => {
  if (!isValidObjectId(id)) {
    return {
      success: false,
      message: "ID is required",
    };
  }

  const data = await Contact.findByIdAndDelete(id);
  if (!data) {
    return {
      success: false,
      message: "Enquiry not found",
    };
  }

  return {
    success: true,
    message: "Enquiry Deleted Successfully",
  };
};
