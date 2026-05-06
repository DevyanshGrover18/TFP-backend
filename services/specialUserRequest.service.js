import { isValidObjectId } from "mongoose";
import SpecialUser from "../models/SpecialUser.js";
import SpecialUserRequest from "../models/SpecialUserRequest.js";

export const createRequestService = async ({name, companyName, email}) =>{
    const existingUser = await SpecialUser.findOne({email});
    if(existingUser){
        return {
            success : false,
            message : "Email already exists"
        }
    }

    const existingRequest = await SpecialUserRequest.findOne({ email, status: "pending" });
    if (existingRequest) {
        return {
            success: false,
            message: "A request with this email is already pending"
        }
    }

    const newUser = await SpecialUserRequest.create({
        name,
        companyName,
        email
    })

    return {
        success : true,
        message : "Request Sent",
    }
}

export const getAllRequestsService = async ()=>{
    const requests = await SpecialUserRequest.find({}).sort({ createdAt: -1 });
    return {
        success : true,
        requests
    }
}

export const getRequestsByIdService = async(id) => {
    if(!isValidObjectId(id)){
        return {
            success : false,
            message : "Invalid id"
        }
    }
    const request = await SpecialUserRequest.findById(id);
    if(!request){
        return {
            success : false, 
            message : "Request not found"
        }
    }

    return {
        success : true,
        request
    }
}

export const updateRequestStatusService = async (id, status) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            message: "Invalid id"
        }
    }

    if (!["approved", "declined"].includes(status)) {
        return {
            success: false,
            message: "Status must be 'approved' or 'declined'"
        }
    }

    const request = await SpecialUserRequest.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!request) {
        return {
            success: false,
            message: "Request not found"
        }
    }

    return {
        success: true,
        message: `Request ${status}`,
        request
    }
}

export const deleteRequestService = async (id) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            message: "Invalid id"
        }
    }

    const request = await SpecialUserRequest.findByIdAndDelete(id);
    if (!request) {
        return {
            success: false,
            message: "Request not found"
        }
    }

    return {
        success: true,
        message: "Request deleted"
    }
}
