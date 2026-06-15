import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: true,
  },
  title: {
    en: { type: String },
    hi: { type: String },
  },
  type: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: null,
  },
  videoUrl: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    // default: true,
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

export default mongoose.model("Gallery", GallerySchema);
