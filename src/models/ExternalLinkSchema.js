import mongoose from "mongoose";

const externalLinkSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },

  title: {
    en: { type: String, required: true },
    hi: { type: String },
  },

  link: {
    type: String,
    required: true,
    match: [/^https?:\/\/.+/, "Please use a valid URL"],
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

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
  },
});

export default mongoose.model("ExternalLink", externalLinkSchema);
