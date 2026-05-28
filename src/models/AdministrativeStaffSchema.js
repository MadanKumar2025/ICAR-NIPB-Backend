import mongoose from "mongoose";

const administrativeStaffSchema = new mongoose.Schema({
  department: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  staffName: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  designationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designation",
    required: true,
  },

  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"],
  },

  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },

  education: {
    en: { type: String },
    hi: { type: String },
  },

  imageTitle: {
    type: String,
  },

  photo: {
    type: String,
    default: null,
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

export default mongoose.model("AdministrativeStaff", administrativeStaffSchema);
