import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  pageTitle: {
    en: { type: String, required: true, unique: true },
    hi: { type: String, required: true, unique: true },
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  subtitle: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  metaDescription: {
    type: String,
    default: "",
  },
  designTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  keyword: {
    type: [String],
    default: [],
    validate: {
      validator: function (value) {
        return value.length <= 100;
      },
      message: "You can add up to 100 keywords only",
    },
  },
  seoPageType: {
    type: String,
    default: "",
  },
  photo: {
    type: String,
    required: true,
  },
  imageTitle: {
    type: String,
    default: "",
  },
  apiName: {
    type: String,
    // required: true,
    trim: true,
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
  },
  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedate: {
    type: Date,
  },
});

export default mongoose.model("Page", pageSchema);
