import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  bannerImage: {
    type: String,
    required: true,
  },
  bannerTitle: {
    type: String,
    required: true,
  },
  title: {
    en: {
      type: String,
    },
    hi: {
      type: String,
    },
  },
  subTitle: {
    en: {
      type: String,
    },
    hi: {
      type: String,
    },
  },
  displayOrderNo: {
    type: Number,
    required: true,
    default: 0,
    unique: true,
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

export default mongoose.model("Banner", bannerSchema);
