import mongoose from "mongoose";

const ApiFunctionMappingSchema = new mongoose.Schema({
  functionalityName: {
    type: String,
    required: true,
    trim: true,
  },

  apiName: {
    type: String,
    required: true,
    trim: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("ApiFunctionMapping", ApiFunctionMappingSchema);