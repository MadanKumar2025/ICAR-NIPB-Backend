import mongoose from "mongoose";

const ProfessorSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, "English name is required"],
      required: true,
    },
    hi: {
      type: String,
      required: [true, "Hindi name is required"],
      required: true,
    },
  },

  workingPeriod: {
    type: String,
   },

  email1: {
    type: String,
    required: [true, "Primary email is required"],
    trim: true,
    lowercase: true,
  },

  email2: {
    type: String,
    trim: true,
    lowercase: true,
  },

  phone: {
    type: String,
    trim: true,
  },

  education: {
    en: {
      type: String,
    },
    hi: {
      type: String,
    },
  },

  photoTitle: {
    type: String,
  },

  photo: {
    type: String,
    default: null,
  },

  message: {
    en: {
      type: String,
    },
    hi: {
      type: String,
    },
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdate: {
    type: Date,
    default: Date.now,
  },

  updatedate: {
    type: Date,
  },
});

export default mongoose.model("Professor", ProfessorSchema);
