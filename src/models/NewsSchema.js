import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  title: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  link: {
    type: String,
    default: null,
  },
  documentFile: {
    type: String,
  },
  publishDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  markAsNew: {
    type: Boolean,
    default: false,
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

export default mongoose.model("News", NewsSchema);
