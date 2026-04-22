import mongoose from "mongoose";

const specialUserSchema = new mongoose.Schema(
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
        type : String,
        default : "special"
    },
    allowedCategories : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : "Category",
        required : true,
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SpecialUser", specialUserSchema);
