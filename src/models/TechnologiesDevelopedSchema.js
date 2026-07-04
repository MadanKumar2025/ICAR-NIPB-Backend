import mongoose from "mongoose";

const technologiesDevelopedSchema = new mongoose.Schema({
  nameOfOtherParty: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  collaboratingInstituteICAR: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  nameOfTechnology: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  mouDate: {
    type: Date,
    required: true,
  },
  duration: {
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
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
  },
});

export default mongoose.model(
  "TechnologiesDeveloped",
  technologiesDevelopedSchema,
);
