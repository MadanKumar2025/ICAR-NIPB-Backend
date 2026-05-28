import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
      unique: true,
    },
    htmlDescription: {
      type: String,
      required: true,
    },
    createby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updateby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Template", templateSchema);