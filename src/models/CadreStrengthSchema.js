import mongoose from "mongoose";

const cadreStrengthSchema = new mongoose.Schema({
  staff: {
    en: {
      type: String,
      required: true,
    },
    hi: {
      type: String,
      required: true,
    },
  },
  sanctionedStrength: {
    type: Number,
    required: true,
  },
  filled: {
    type: Number,
    required: true,
  },
  vacant: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdate: {
    type: Date,
    default: Date.now,
  },
  updatedate: {
    type: Date,
  },
  createby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("CadreStrength", cadreStrengthSchema);