import {
  createContactService,
  deleteContact,
  getAllContactService,
  getContactById,
} from "../services/contact.service.js";

export const createEnquiry = async (req, res, next) => {
  try {
    const data = req.body ?? {};
    if (!data.name || !data.companyName || !data.email || !data.phone || !data.reason || !data.message) {
      return res.status(400).json({
        success: false,
        message: "Please fill the form",
      });
    }

    const { success, message } = await createContactService(data);
    res.status(200).json({
      success,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }
    const { success, contact, message } = await getContactById({ id });
    if (!success) {
      return res.status(404).json({
        success,
        message,
      });
    }
    res.status(200).json({
      success,
      contact,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEnquiries = async (req, res, next) => {
  try {
    const { success, contacts, message } = await getAllContactService();
    if (!success) {
      return res.status(404).json({
        success,
        message,
      });
    }

    res.status(200).json({
      success,
      contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEnquiry = async (req, res, next) =>{
  try {
    const {id} = req.params;
    if(!id){
      return res.status(400).json({
        success : false,
        message : "ID is required"
      });
    }
    const {success, message} = await deleteContact({ id });
    if(!success){
      return res.status(404).json({
        success,
        message
      });
    }
    res.status(200).json({
      success,
      message
    });
  } catch (error) {
    next(error);
  }
};
