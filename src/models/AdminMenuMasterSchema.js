import mongoose from "mongoose";

const adminMenuMasterSchema = new mongoose.Schema({
  menuName: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  displayOrderNumber: {
    type: Number,
    required: true,
  },
  parentMenuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminMenuMaster",
    default: null,
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

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
  },
});

export default mongoose.model("AdminMenuMaster", adminMenuMasterSchema);
