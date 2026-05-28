import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  eventBannerPhoto: {
    type: String,
    default: null,
    required: true,
  },
  eventPhoto: {
    type: String,
    default: null,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  location: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  description: {
    en: { type: String },
    hi: { type: String },
  },
  registrationLink: {
    type: String,
    default: null,
  },
  registrationStartTime: {
    type: Date,
    default: null,
  },
  registrationEndTime: {
    type: Date,
    default: null,
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

export default mongoose.model("Event", eventSchema);
