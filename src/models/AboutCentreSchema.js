import mongoose from "mongoose";

const AboutCentreSchema = new mongoose.Schema({
  topSection: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  topImage: {
    type: String,
    default: null,
  },

 
  MediyamSection1: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  MediyamSection2: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  MediyamSection3: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  // Optional fields
  BotemSection: {
    en: { type: String, default: null },
    hi: { type: String, default: null },
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

export default mongoose.model("AboutCentre", AboutCentreSchema);
