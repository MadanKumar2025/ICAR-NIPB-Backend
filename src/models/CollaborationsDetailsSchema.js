import mongoose from "mongoose";

const collaborationDetailsSchema = new mongoose.Schema({
  CollaborationsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collaborations",
    required: true,
  },

  subTitle: {
    en: {
      type: String,
      required: true,
    },
    hi: {
      type: String,
      required: true,
    },
  },

  link: {
    type: String,
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

export default mongoose.model(
  "CollaborationsDetails",
  collaborationDetailsSchema,
);
