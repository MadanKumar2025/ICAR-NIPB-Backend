import mongoose from "mongoose";

const VigilanceOfficerSchema = new mongoose.Schema({
  // Multilingual Name
  name: {
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

  // Multilingual Type
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

  photo: {
    type: String,
    required: true,
    trim: true,
  },

  photoTitle: {
    type: String,
    trim: true,
  },

   
  number: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  // Reference to a Designation collection
  designationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designation",
    required: true,
  },

  // Active status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },

  // References to user who created/updated
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

 

export default mongoose.model("VigilanceOfficer", VigilanceOfficerSchema);
