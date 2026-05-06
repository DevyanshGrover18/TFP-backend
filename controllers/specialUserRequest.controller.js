import {
  createRequestService,
  getAllRequestsService,
  getRequestsByIdService,
  updateRequestStatusService,
  deleteRequestService,
} from "../services/specialUserRequest.service.js";

export const createRequest = async (req, res, next) => {
  try {
    const { name, companyName, email } = req.body;
    if (!name || !email || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Name, company name and email are required",
      });
    }

    const { message, success } = await createRequestService({
      name,
      companyName,
      email,
    });

    if (!success) {
      return res.status(400).json({
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

export const getAllRequests = async (req, res, next) => {
  try {
    const { success, message, requests } = await getAllRequestsService();
    if (!success) {
      return res.status(404).json({
        success,
        message,
      });
    }
    res.status(200).json({
      success,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }
    const { success, message, request } = await getRequestsByIdService(id);
    if (!success) {
      return res.status(404).json({
        success,
        message,
      });
    }
    res.status(200).json({
      success,
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const result = await updateRequestStatusService(id, status);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }

    const result = await deleteRequestService(id);
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
