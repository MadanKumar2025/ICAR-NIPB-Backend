import OrganizationDetails from "../models/OrganizationDetailsSchema.js";
import fs from "fs";
import path from "path";

export const createOrganization = async (req, res) => {
  try {
    const {
      organizationName_en,
      organizationName_hi,
      tagLine_en,
      tagLine_hi,
      addressLine1_en,
      addressLine1_hi,
      addressLine2_en,
      addressLine2_hi,
      city_en,
      city_hi,
      state_en,
      state_hi,
      pinCode,
      contactNumber,
      faxNumber,
      email1,
      email2,
      websiteLink,
      facebookLink,
      twitterLink,
      linkedinLink,
      youtubeLink,
      instagramLink,
      googleMapLink,
      logo1Title,
      logo2Title,
      paymentUrl,
    } = req.body;

    // --- Validations ---
    const requiredFields = [
      {
        en: organizationName_en,
        hi: organizationName_hi,
        name: "Organization Name",
      },
      { en: tagLine_en, hi: tagLine_hi, name: "Tagline" },
      { en: addressLine1_en, hi: addressLine1_hi, name: "Address Line 1" },
      { en: city_en, hi: city_hi, name: "City" },
      { en: state_en, hi: state_hi, name: "State" },
    ];

    for (const field of requiredFields) {
      if (!field.en || !field.hi) {
        return res.status(400).json({
          success: false,
          message: `${field.name} is required in both English & Hindi`,
        });
      }
    }

    if (paymentUrl && !/^https?:\/\/.+/.test(paymentUrl)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment URL",
      });
    }

    if (!pinCode || !/^[0-9]{6}$/.test(pinCode))
      return res
        .status(400)
        .json({ success: false, message: "PIN code must be exactly 6 digits" });

    if (!contactNumber || !/^[0-9]{10}$/.test(contactNumber))
      return res.status(400).json({
        success: false,
        message: "Contact number must be exactly 10 digits",
      });

    if (!email1)
      return res
        .status(400)
        .json({ success: false, message: "Primary email is required" });

    if (!websiteLink)
      return res
        .status(400)
        .json({ success: false, message: "Website link is required" });

    if (!googleMapLink)
      return res
        .status(400)
        .json({ success: false, message: "Google map link is required" });

    if (!req.files || !req.files.logo1)
      return res
        .status(400)
        .json({ success: false, message: "Logo1 is required" });

    const logo1 = req.files.logo1[0].filename;
    const logo2 = req.files.logo2 ? req.files.logo2[0].filename : "";

    const createby = req.user.id;

    // --- Create Organization Object ---
    const organization = new OrganizationDetails({
      organizationName: { en: organizationName_en, hi: organizationName_hi },
      tagLine: { en: tagLine_en, hi: tagLine_hi },
      addressLine1: { en: addressLine1_en, hi: addressLine1_hi },
      addressLine2:
        addressLine2_en || addressLine2_hi
          ? { en: addressLine2_en, hi: addressLine2_hi }
          : null,
      city: { en: city_en, hi: city_hi },
      state: { en: state_en, hi: state_hi },
      pinCode,
      contactNumber,
      faxNumber,
      email1,
      email2,
      websiteLink,
      facebookLink,
      twitterLink,
      linkedinLink,
      youtubeLink,
      instagramLink,
      googleMapLink,
      paymentUrl,
      logo1,
      logo1Title,
      logo2,
      logo2Title,
      createby,
      createdate: new Date(),
    });

    const savedOrganization = await organization.save();

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: savedOrganization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res
        .status(400)
        .json({ success: false, message: `${field} already exists` });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }

    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await OrganizationDetails.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = organizations.map((org) => ({
      id: org._id,
      organizationName: org.organizationName || { en: "", hi: "" },
      tagLine: org.tagLine || { en: "", hi: "" },
      addressLine1: org.addressLine1 || { en: "", hi: "" },
      addressLine2: org.addressLine2 || { en: "", hi: "" },
      city: org.city || { en: "", hi: "" },
      state: org.state || { en: "", hi: "" },
      pinCode: org.pinCode || "",
      contactNumber: org.contactNumber || "",
      faxNumber: org.faxNumber || "",
      email1: org.email1 || "",
      email2: org.email2 || "",
      websiteLink: org.websiteLink || "",
      facebookLink: org.facebookLink || "",
      twitterLink: org.twitterLink || "",
      linkedinLink: org.linkedinLink || "",
      youtubeLink: org.youtubeLink || "",
      instagramLink: org.instagramLink || "",
      googleMapLink: org.googleMapLink || "",
      paymentUrl: org.paymentUrl || "",
      logo1: org.logo1 || "",
      logo1Title: org.logo1Title || "",
      logo2: org.logo2 || "",
      logo2Title: org.logo2Title || "",
      isActive: org.isActive,
      createdBy: org.createby || null,
      updatedBy: org.updateby || null,
      createdAt: org.createdate,
      updatedAt: org.updatedate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organizations",
    });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      organizationName_en,
      organizationName_hi,
      tagLine_en,
      tagLine_hi,
      logo1,
      logo1Title,
      logo2,
      logo2Title,
      addressLine1_en,
      addressLine1_hi,
      addressLine2_en,
      addressLine2_hi,
      city_en,
      city_hi,
      state_en,
      state_hi,
      pinCode,
      contactNumber,
      faxNumber,
      email1,
      email2,
      websiteLink,
      facebookLink,
      twitterLink,
      linkedinLink,
      youtubeLink,
      instagramLink,
      googleMapLink,
      paymentUrl,
      isActive,
    } = req.body;

    const record = await OrganizationDetails.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // organizationName
    if (
      organizationName_en !== undefined ||
      organizationName_hi !== undefined
    ) {
      record.organizationName = {
        en: organizationName_en ?? record.organizationName.en,
        hi: organizationName_hi ?? record.organizationName.hi,
      };
    }

    // tagLine
    if (tagLine_en !== undefined || tagLine_hi !== undefined) {
      record.tagLine = {
        en: tagLine_en ?? record.tagLine.en,
        hi: tagLine_hi ?? record.tagLine.hi,
      };
    }

    // addressLine1
    if (addressLine1_en !== undefined || addressLine1_hi !== undefined) {
      record.addressLine1 = {
        en: addressLine1_en ?? record.addressLine1.en,
        hi: addressLine1_hi ?? record.addressLine1.hi,
      };
    }

    // addressLine2
    if (addressLine2_en !== undefined || addressLine2_hi !== undefined) {
      record.addressLine2 = {
        en: addressLine2_en ?? record.addressLine2.en,
        hi: addressLine2_hi ?? record.addressLine2.hi,
      };
    }

    // city
    if (city_en !== undefined || city_hi !== undefined) {
      record.city = {
        en: city_en ?? record.city.en,
        hi: city_hi ?? record.city.hi,
      };
    }

    // state
    if (state_en !== undefined || state_hi !== undefined) {
      record.state = {
        en: state_en ?? record.state.en,
        hi: state_hi ?? record.state.hi,
      };
    }

    // simple fields
    if (logo1 !== undefined) record.logo1 = logo1;
    if (logo1Title !== undefined) record.logo1Title = logo1Title;

    // if (logo2 !== undefined) record.logo2 = logo2;
    // if (logo2Title !== undefined) record.logo2Title = logo2Title;

    if (req.files?.logo2?.length > 0) {
      record.logo2 = req.files.logo2[0].filename;
    }

    if (req.files?.logo1?.length > 0) {
      record.logo1 = req.files.logo1[0].filename;
    }
    if (pinCode !== undefined) record.pinCode = pinCode;
    if (contactNumber !== undefined) record.contactNumber = contactNumber;

    if (faxNumber !== undefined) record.faxNumber = faxNumber;

    if (email1 !== undefined) record.email1 = email1.trim().toLowerCase();

    if (email2 !== undefined) record.email2 = email2?.trim().toLowerCase();

    if (websiteLink !== undefined) record.websiteLink = websiteLink;

    if (facebookLink !== undefined) record.facebookLink = facebookLink;
    if (twitterLink !== undefined) record.twitterLink = twitterLink;
    if (linkedinLink !== undefined) record.linkedinLink = linkedinLink;
    if (youtubeLink !== undefined) record.youtubeLink = youtubeLink;
    if (instagramLink !== undefined) record.instagramLink = instagramLink;

    if (googleMapLink !== undefined) record.googleMapLink = googleMapLink;

    //  paymentUrl added here
    if (paymentUrl !== undefined) record.paymentUrl = paymentUrl;

    if (isActive !== undefined) {
      record.isActive = isActive === "true" || isActive === true;
    }

    record.updateby = req.user?.id || null;
    record.updatedate = new Date();

    const updatedRecord = await record.save();

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update Organization Error =>", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// this is use for web
export const getAllOrganizationsWeb = async (req, res) => {
  try {
    const organizations = await OrganizationDetails.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = organizations.map((org) => ({
      id: org._id,
      organizationName: org.organizationName || { en: "", hi: "" },
      tagLine: org.tagLine || { en: "", hi: "" },
      addressLine1: org.addressLine1 || { en: "", hi: "" },
      addressLine2: org.addressLine2 || { en: "", hi: "" },
      city: org.city || { en: "", hi: "" },
      state: org.state || { en: "", hi: "" },
      pinCode: org.pinCode || "",
      contactNumber: org.contactNumber || "",
      faxNumber: org.faxNumber || "",
      email1: org.email1 || "",
      email2: org.email2 || "",
      websiteLink: org.websiteLink || "",
      facebookLink: org.facebookLink || "",
      twitterLink: org.twitterLink || "",
      linkedinLink: org.linkedinLink || "",
      youtubeLink: org.youtubeLink || "",
      instagramLink: org.instagramLink || "",
      googleMapLink: org.googleMapLink || "",
      paymentUrl: org.paymentUrl || "",
      logo1: org.logo1 || "",
      logo1Title: org.logo1Title || "",
      logo2: org.logo2 || "",
      logo2Title: org.logo2Title || "",
      isActive: org.isActive,
      createdBy: org.createby || null,
      updatedBy: org.updateby || null,
      createdAt: org.createdate,
      updatedAt: org.updatedate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organizations",
    });
  }
};