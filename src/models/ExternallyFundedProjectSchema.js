import mongoose from "mongoose";

const externallyFundedProjectSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  fundingAgency: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  sanctionedBudget: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  principalInvestigator: {
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
  "ExternallyFundedProject",
  externallyFundedProjectSchema,
);
