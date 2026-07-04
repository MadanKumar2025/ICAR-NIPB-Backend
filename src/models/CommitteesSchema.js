import mongoose from "mongoose";

const CommitteesSchema = new mongoose.Schema({
  content: {
    en: {
      type: String,
      required: true,
      trim: true,
    },
    hi: {
      type: String,
      required: true,
      trim: true,
    },
  },

  type: {
    en: {
      type: String,
      required: true,
      trim: true,
    },
    hi: {
      type: String,
      required: true,
      trim: true,
    },
  },
  displayOrder: {
    type: Number,
    default: 0,
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

export default mongoose.model("Committees", CommitteesSchema);
