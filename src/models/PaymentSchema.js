import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  bankDetails: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  photoTitle: {
    type: String,
    required: true,
  },

  photo: {
    type: String,
    default: null,
    required: true,
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

export default mongoose.model("Payment", paymentSchema);
