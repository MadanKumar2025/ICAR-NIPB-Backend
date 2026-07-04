import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContractualStaffSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
    },

    position: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
    },

    associatedLabDivision: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || emailRegex.test(v);
        },
        message: "Please enter a valid email address",
      },
    },

    photo: {
      type: String,
      required: true,
    },

    photoTitle: {
      type: String,
      trim: true,
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
  },
  { timestamps: true }
);

export default mongoose.model("ContractualStaff", ContractualStaffSchema);