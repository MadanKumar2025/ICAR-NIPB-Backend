import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  organizationName: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  tagLine: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  logo1: {
    type: String,
    required: true,
  },

  logo1Title: {
    type: String,
  },

  logo2: {
    type: String,
  },

  logo2Title: {
    type: String,
  },

  addressLine1: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  addressLine2: {
    en: { type: String },
    hi: { type: String },
  },

  city: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  state: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  pinCode: {
    type: String,
    required: true,
    match: [/^[0-9]{6}$/, "PIN code must be exactly 6 digits"],
  },

  contactNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Contact number must be exactly 10 digits"],
  },

  faxNumber: {
    type: String,
  },

  email1: {
    type: String,
    required: true,
    lowercase: true,
  },

  email2: {
    type: String,
    lowercase: true,
  },

  websiteLink: {
    type: String,
    required: true,
  },

  facebookLink: {
    type: String,
  },

  twitterLink: {
    type: String,
  },

  linkedinLink: {
    type: String,
  },

  youtubeLink: {
    type: String,
  },

  instagramLink: {
    type: String,
  },

  googleMapLink: {
    type: String,
    required: true,
  },
  paymentUrl: {
    type: String,
    match: [/^https?:\/\/.+/, "Invalid payment URL"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  createdate: {
    type: Date,
    default: Date.now,
  },

  createby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedate: {
    type: Date,
  },
});

export default mongoose.model("OrganizationDetails", organizationSchema);
