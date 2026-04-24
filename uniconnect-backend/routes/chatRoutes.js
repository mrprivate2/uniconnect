import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { getChatHistory, uploadChatMedia } from "../controllers/chatController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ✅ Get chat history with another user
router.get("/:userId", protect, getChatHistory);

// ✅ Upload image in chat
router.post("/upload", protect, upload.single("media"), uploadChatMedia);

export default router;
