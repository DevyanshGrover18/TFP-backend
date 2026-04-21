import mongoose from "mongoose";

const CartItem = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: String,
      default : undefined
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

const CartSchema = new mongoose.Schema({  
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required : true,
    },
    items :{
        type : [CartItem],
        default : []
    }
})

export default mongoose.model("Cart", CartSchema)
