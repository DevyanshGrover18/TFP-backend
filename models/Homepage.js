import mongoose from "mongoose";

const homepageSchema = new mongoose.Schema({
  images: [
    {
      url: { type: String, required: true },
    },
  ],
});

export default mongoose.model("Homepage", homepageSchema);
