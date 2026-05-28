import mongoose from "mongoose";

const DirectorSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
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
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },

  phone: {
    type: String,
    trim: true,
    match: [
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian phone number",
    ],
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
