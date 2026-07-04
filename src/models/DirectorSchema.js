import mongoose from "mongoose";

const DirectorSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  message: {
    en: { type: String },
    hi: { type: String },
  },
  workingPeriod: {
    type: String,
    required: true,
  },
  photoTitle: {
    type: String,
  },
  photo: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    trim: true,
  },

  phone: {
    type: String,
    trim: true,
  },
  education: {
    en: { type: String },
    hi: { type: String },
  },
  acting: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdate: {
    type: Date,
    default: Date.now,
  },
  updatedate: {
    type: Date,
  },
});

export default mongoose.model("Director", DirectorSchema);
