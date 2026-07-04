import mongoose from "mongoose";

const institutionalProjectSchema = new mongoose.Schema({
  mainProject: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  groupLeader: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
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
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
  },
});

export default mongoose.model(
  "InstitutionalProject",
  institutionalProjectSchema,
);
