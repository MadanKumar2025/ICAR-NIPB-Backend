import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createEvent,
  getAllEvents,
  updateEvent,
  updateEventStatus,
  getAllEventsWeb,getEventById,
} from "../controllers/eventController.js";

const router = express.Router();

router.post(
  "/createEvent",
  authMiddleware,
  upload.fields([
    { name: "eventBannerPhoto", maxCount: 1 },
    { name: "eventPhoto", maxCount: 1 },
  ]),
  createEvent,
);

router.get("/allEvent", authMiddleware, getAllEvents);
router.put(
  "/updateEvent/:id",
  authMiddleware,
  upload.fields([
    { name: "eventBannerPhoto", maxCount: 1 },
    { name: "eventPhoto", maxCount: 1 },
  ]),
  updateEvent,
);

router.patch("/updateEventStatus/:id", authMiddleware, updateEventStatus);

// this is use for web
router.get("/get/web", getAllEventsWeb);
router.get("/get/web/:id", getEventById);

export default router;
