import mongoose from "mongoose";

const AssociatedOrganizationSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true,
  },
  photoTitle: {
    type: String,
    required: true,
  },
  relatedLink: {
    type: String,
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

export default mongoose.model(
  "AssociatedOrganization",
  AssociatedOrganizationSchema,
);
