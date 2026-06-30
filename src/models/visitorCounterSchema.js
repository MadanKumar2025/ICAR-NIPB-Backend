import mongoose from "mongoose";

const visitorCounterSchema = new mongoose.Schema({
  todayDate: {
    type: Date,
    required: true,
    default: Date.now,
  },

  todayViews: {
    type: Number,
    default: 0,
  },

  totalViews: {
    type: Number,
    default: 0,
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
    required: true,
  },

  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedate: {
    type: Date,
  },
});

export default mongoose.model("VisitorCounter", visitorCounterSchema);