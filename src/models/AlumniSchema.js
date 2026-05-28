import mongoose from "mongoose";

const urlRegex =
  /^https?:\/\/([\w\d-]+\.)+[\w-]+(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const urlField = {
  type: String,
  trim: true,
  validate: {
    validator: function (v) {
      return !v || urlRegex.test(v);
    },
    message: "Please enter a valid URL (must start with http/https)",
  },
};

const AlumniSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
    },

    batch: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
    },

    degree: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return emailRegex.test(v);
        },
        message: "Please enter a valid email address",
      },
    },

    profileLink: urlField,
    facebook: urlField,
    twitter: urlField,
    youtube: urlField,
    linkedin: urlField,
    instagram: urlField,

    photo: {
      type: String,
      required: true,
    },

    photoTitle: {
      type: String,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedDate: {
      type: Date,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Alumni", AlumniSchema);
