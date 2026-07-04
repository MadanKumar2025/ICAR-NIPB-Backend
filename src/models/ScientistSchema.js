import mongoose from "mongoose";

const scientistSchema = new mongoose.Schema({
  scientistName: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },

  designationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designation",
    required: true,
  },

  phone1: {
    type: String,
  },

  phone2: {
    type: String,
  },

  email1: {
    type: String,
  },

  email2: {
    type: String,
  },

  education: {
    en: { type: String },
    hi: { type: String },
  },
  majorCourses: {
    en: { type: String },
    hi: { type: String },
  },

  photoTitle: {
    type: String,
  },

  photo: {
    type: String,
    default: null,
  },
  galleryPhotos: [
    {
      galleryPhotostitle: {
        type: String,
      },
      galleryPhotos: {
        type: String,
      },
      orderNumberGallery: {
        type: Number,
        default: 0,
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },

  researchInterest: {
    en: { type: String },
    hi: { type: String },
  },

  publications: {
    en: { type: String },
    hi: { type: String },
  },

  IPR: {
    en: { type: String },
    hi: { type: String },
  },

  awards: {
    en: { type: String },
    hi: { type: String },
  },

  externallyFundedProjects: {
    en: { type: String },
    hi: { type: String },
  },

  labProfile: [
    {
      name: {
        en: { type: String },
        hi: { type: String },
      },
      position: {
        en: { type: String },
        hi: { type: String },
      },
      project: {
        en: { type: String },
        hi: { type: String },
      },
      duration: {
        en: { type: String },
        hi: { type: String },
      },
      ImageTitle: {
        type: String,
      },
      photo1: {
        type: String,
      },
    },
  ],

  displayOrder: {
    type: Number,
    required: true,
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

export default mongoose.model("Scientist", scientistSchema);
