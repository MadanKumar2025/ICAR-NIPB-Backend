import mongoose from "mongoose";

const PreviousDirectorSchema = new mongoose.Schema({
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

export default mongoose.model("PreviousDirector", PreviousDirectorSchema);
