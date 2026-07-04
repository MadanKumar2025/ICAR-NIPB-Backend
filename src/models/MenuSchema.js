import mongoose from "mongoose";
const menuSchema = new mongoose.Schema({
  menuType: {
    type: String,
    required: true,
  },
  menuCategory: {
    type: String,
    required: true,
  },
  parentMenuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    default: null,
  },
  menuName: {
    en: { type: String, required: true, unique: true },
    hi: { type: String, required: true, unique: true },
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page",
    default: null,
  },
  customUrl: {
    type: String,
    default: null,
  },
  order: {
    type: Number,
    default: 0,
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

export default mongoose.model("Menu", menuSchema);
