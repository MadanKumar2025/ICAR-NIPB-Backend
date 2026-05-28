import Payment from "../models/PaymentSchema.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const createPayment = async (req, res) => {
  try {
    let { bankDetails_en, bankDetails_hi, photoTitle } = req.body;

    // Trim values
    bankDetails_en = bankDetails_en?.trim();
    bankDetails_hi = bankDetails_hi?.trim();
    photoTitle = photoTitle?.trim();

    // Validation
    if (!bankDetails_en) {
      return res.status(400).json({
        success: false,
        message: "Bank details (English) is required",
      });
    }

    if (!bankDetails_hi) {
      return res.status(400).json({
        success: false,
        message: "Bank details (Hindi) is required",
      });
    }

    if (!photoTitle) {
      return res.status(400).json({
        success: false,
        message: "Photo title is required",
      });
    }

    // Check image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    // Allowed image types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only image files (jpeg, png, jpg, webp) are allowed",
      });
    }

    // Image filename
    const photo = req.file.filename;

    // User
    const createdBy = req.user?.id || null;

    // Create payment object
    const payment = new Payment({
      bankDetails: {
        en: bankDetails_en,
        hi: bankDetails_hi,
      },
      photoTitle,
      photo,
      createdBy,
    });

    // Save
    const savedPayment = await payment.save();

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: savedPayment,
    });
  } catch (error) {
    console.error(error);

    // Duplicate error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val) => val.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = payments.map((item) => ({
      id: item._id,
      bankDetails: item.bankDetails || { en: "", hi: "" },
      photoTitle: item.photoTitle || "",
      photo: item.photo,
      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdDate: item.createdDate,
      updatedDate: item.updatedDate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching payments",
    });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing payment ID",
      });
    }

    const { bankDetails_en, bankDetails_hi, photoTitle, isActive } =
      req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

 
    if (bankDetails_en && bankDetails_en.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bank details (English) cannot be empty",
      });
    }

    if (bankDetails_hi && bankDetails_hi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bank details (Hindi) cannot be empty",
      });
    }

    if (photoTitle && photoTitle.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Photo title cannot be empty",
      });
    }

 
    if (req.file) {
      if (payment.photo) {
        const oldFilePath = path.join(
          process.cwd(),
          "uploads",
          payment.photo
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      payment.photo = req.file.filename;
    }

 
    if (bankDetails_en || bankDetails_hi) {
      payment.bankDetails = {
        en: bankDetails_en
          ? bankDetails_en.trim()
          : payment.bankDetails?.en,
        hi: bankDetails_hi
          ? bankDetails_hi.trim()
          : payment.bankDetails?.hi,
      };
    }

    if (photoTitle !== undefined) {
      payment.photoTitle = photoTitle || payment.photoTitle;
    }

    if (isActive !== undefined) {
      payment.isActive = isActive;
    }

    payment.updatedBy = req.user?.id;
    payment.updatedDate = new Date();

    const updatedPayment = await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};



// this is use for web
export const getPaymentsWeb = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = payments.map((item) => ({
      id: item._id,
      bankDetails: item.bankDetails || { en: "", hi: "" },
      photoTitle: item.photoTitle || "",
      photo: item.photo,
      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdDate: item.createdDate,
      updatedDate: item.updatedDate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching payments",
    });
  }
};
