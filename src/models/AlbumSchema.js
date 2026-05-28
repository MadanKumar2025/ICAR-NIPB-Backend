import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  type: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  title: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  venue: {
    en: { type: String, default: null },
    hi: { type: String, default: null },
  },
  publishDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  coverPic: {
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
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
  },
});

export default mongoose.model("Album", albumSchema);
