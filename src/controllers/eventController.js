import Event from "../models/EventSchema.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

export const createEvent = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      startTime,
      endTime,
      location_en,
      location_hi,
      description_en,
      description_hi,
      registrationLink,
      registrationStartTime,
      registrationEndTime,
      isActive,
    } = req.body;

    // Validate
    if (!name_en || !name_hi) {
      return res.status(400).json({
        success: false,
        message: "Both English & Hindi name required",
      });
    }
    if (!req.files || !req.files.eventBannerPhoto)
      return res
        .status(400)
        .json({ success: false, message: "Event banner photo is required" });
    if (!req.files || !req.files.eventPhoto)
      return res
        .status(400)
        .json({ success: false, message: "Event photo is required" });
    if (!startTime)
      return res
        .status(400)
        .json({ success: false, message: "Event start time is required" });
    if (!endTime)
      return res
        .status(400)
        .json({ success: false, message: "Event end time is required" });
    if (!location_en || !location_hi) {
      return res.status(400).json({
        success: false,
        message: "Location required in both languages",
      });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: "Event end time must be after start time",
      });
    }

    const eventBannerPhoto = req.files.eventBannerPhoto[0].filename;
    const eventPhoto = req.files.eventPhoto[0].filename;
    const createby = req.user.id;

    const event = new Event({
      name: {
        en: name_en,
        hi: name_hi,
      },
      eventBannerPhoto,
      eventPhoto,
      startTime,
      endTime,
      location: {
        en: location_en,
        hi: location_hi,
      },
      description: {
        en: description_en,
        hi: description_hi,
      },
      registrationLink,
      registrationStartTime,
      registrationEndTime,
      isActive: isActive ?? true,
      createby,
      createdate: new Date(),
    });

    const savedEvent = await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: savedEvent,
    });
  } catch (error) {
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

// this is use for Admin
export const getAllEvents = async (req, res) => {
  try {
    const eventList = await Event.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = eventList.map((event) => ({
      id: event._id,
      name: event.name || { en: "", hi: "" },
      location: event.location || { en: "", hi: "" },
      description: event.description || { en: "", hi: "" },
      eventBannerPhoto: event.eventBannerPhoto,
      eventPhoto: event.eventPhoto,
      startTime: event.startTime,
      endTime: event.endTime,
      registrationLink: event.registrationLink || "",
      registrationStartTime: event.registrationStartTime || null,
      registrationEndTime: event.registrationEndTime || null,
      isActive: event.isActive,
      createdBy: event.createby || null,
      updatedBy: event.updateby || null,
      createdAt: event.createdate,
      updatedAt: event.updatedate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ya missing event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event nahi mila",
      });
    }

    const {
      name_en,
      name_hi,
      startTime,
      endTime,
      location_en,
      location_hi,
      description_en,
      description_hi,
      registrationLink,
      registrationStartTime,
      registrationEndTime,
      isActive,
    } = req.body;

    if ((name_en && !name_hi) || (!name_en && name_hi)) {
      return res.status(400).json({
        success: false,
        message: "Name update karte waqt dono English & Hindi chahiye",
      });
    }

    if ((location_en && !location_hi) || (!location_en && location_hi)) {
      return res.status(400).json({
        success: false,
        message: "Location update karte waqt dono English & Hindi chahiye",
      });
    }

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: "End time start time se pehle nahi ho sakta",
      });
    }

    if (registrationLink && !/^https?:\/\/.+/.test(registrationLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration link",
      });
    }

    if (req.files?.eventBannerPhoto) {
      if (event.eventBannerPhoto) {
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          event.eventBannerPhoto,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      event.eventBannerPhoto = req.files.eventBannerPhoto[0].filename;
    }

    if (req.files?.eventPhoto) {
      if (event.eventPhoto) {
        const oldPath = path.join(process.cwd(), "uploads", event.eventPhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      event.eventPhoto = req.files.eventPhoto[0].filename;
    }

    if (name_en && name_hi)
      event.name = { en: name_en.trim(), hi: name_hi.trim() };
    if (location_en && location_hi)
      event.location = { en: location_en.trim(), hi: location_hi.trim() };
    if (description_en !== undefined && description_hi !== undefined)
      event.description = {
        en: description_en || null,
        hi: description_hi || null,
      };

    if (startTime) event.startTime = new Date(startTime);
    if (endTime) event.endTime = new Date(endTime);
    if (registrationLink !== undefined)
      event.registrationLink = registrationLink || null;
    if (registrationStartTime)
      event.registrationStartTime = new Date(registrationStartTime);
    if (registrationEndTime !== undefined)
      event.registrationendTime = registrationEndTime
        ? new Date(registrationEndTime)
        : null;
    if (isActive !== undefined) event.isActive = isActive;

    event.updateby = req.user?.id;
    event.updatedate = new Date();

    const updatedEvent = await event.save();

    return res.status(200).json({
      success: true,
      message: "Event successfully update ho gaya",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Kuch galat ho gaya",
    });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Validate boolean
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // Update event
    const event = await Event.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updateby: req.user?.id,
        updatedate: new Date(),
      },
      { new: true },
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event status updated successfully",
      data: event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// this is use for web
export const getAllEventsWeb = async (req, res) => {
  try {
    const eventList = await Event.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = eventList.map((event) => ({
      id: event._id,
      name: event.name || { en: "", hi: "" },
      eventBannerPhoto: event.eventBannerPhoto || null,
      eventPhoto: event.eventPhoto || null,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || { en: "", hi: "" },
      description: event.description || { en: "", hi: "" },
      registrationLink: event.registrationLink || null,
      registrationStartTime: event.registrationStartTime || null,
      registrationEndTime: event.registrationEndTime || null,
      isActive: event.isActive,

      createby: event.createby || null,
      updateby: event.updateby || null,

      createdate: event.createdate,
      updatedate: event.updatedate || null,
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
      message: "Error fetching events",
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate("createby", "name email")
      .populate("updateby", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const data = {
      id: event._id,
      name: event.name || { en: "", hi: "" },
      eventBannerPhoto: event.eventBannerPhoto,
      eventPhoto: event.eventPhoto,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || { en: "", hi: "" },
      description: event.description || { en: "", hi: "" },
      registrationLink: event.registrationLink || "",
      registrationStartTime: event.registrationStartTime || null,
      registrationEndTime: event?.registrationEndTime || null,
      isActive: event.isActive,
      createby: event.createby || null,
      updateby: event.updateby || null,
      createdate: event.createdate,
      updatedate: event.updatedate || null,
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching event",
    });
  }
};
