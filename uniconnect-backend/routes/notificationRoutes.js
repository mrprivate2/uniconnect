import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { 
  getNotifications, 
  createAnnouncement, 
  markNotificationAsRead,
  getAllAnnouncements
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/all", protect, admin, getAllAnnouncements);
router.post("/announcement", protect, admin, createAnnouncement);
router.put("/:id/read", protect, markNotificationAsRead);

export default router;
