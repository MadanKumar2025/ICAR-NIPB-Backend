import mongoose from "mongoose";

const pioneerSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  photo: {
    type: String,
    required: true,
  },

  photoTitle: {
    type: String,
  },

  url: {
    type: String,
    match: [/^https?:\/\/.+/, "Invalid Link"],
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdate: {
    type: Date,
    default: Date.now,
  },

  createby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  updatedate: {
    type: Date,
  },

  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("pioneer", pioneerSchema);
