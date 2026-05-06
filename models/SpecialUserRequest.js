import mongoose from "mongoose";

const specialRequest = new mongoose.Schema({
    status : {
        type : String,
        enum : ["pending", "approved", "declined"],
        default : "pending",
    },
    name : {
        type : String,
        require : true,
    },
    companyName : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true
    }
}, { timestamps: true })

export default mongoose.model("SpecialUserRequest", specialRequest)