import mongoose from "mongoose";

const popupSchema = new mongoose.Schema({
  title: {
    type: String,
  },

  photoTitle: {
    type: String,
    required: true,
  },

  photo: {
    type: String,
    required: true,
    default: null,
  },

  url: {
    type: String,
    // required: true,
  },

  startTime: {
    type: Date,
    // required: true,
  },

  endTime: {
    type: Date,
    // required: true,
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

export default mongoose.model("Popup", popupSchema);
