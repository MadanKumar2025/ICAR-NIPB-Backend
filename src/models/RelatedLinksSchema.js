import mongoose from "mongoose";

const RelatedLinksSchema = new mongoose.Schema({
  content: {
    en: {
      type: String,
      required: true,
    },
    hi: {
      type: String,
      required: true,
    },
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

export default mongoose.model("RelatedLinks", RelatedLinksSchema);