import mongoose from "mongoose";

const PublicationsSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      // required: true,
    },
    title: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    category: {
      type: String,
      required: true,
    },

    file: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("PublicationsSchema", PublicationsSchema);
