import mongoose from "mongoose";

const InstitutionalProjectsDetailsSchema = new mongoose.Schema({
  institutionalProjectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstitutionalProject",
    required: true,
  },

  subProjects: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  principalInvestigators: {
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
  "InstitutionalProjectDetails",
  InstitutionalProjectsDetailsSchema,
);
