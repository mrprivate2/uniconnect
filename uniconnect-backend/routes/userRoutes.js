import express from "express";
import multer from "multer";
import { 
  getUsers, 
  getAllUsersAdmin, 
  searchUsers, 
  updateProfile, 
  getPublicKey, 
  getUserProfile, 
  toggleSavePost, 
  uploadAvatar,
  toggleBanUser,
  deleteUser 
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ MULTER SETUP
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware to optionally populate req.user without blocking guests
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

router.get("/", optionalProtect, getUsers);
router.get("/all", protect, admin, getAllUsersAdmin);
router.get("/search", optionalProtect, searchUsers);
router.get("/:id", optionalProtect, getUserProfile);
router.get("/:id/public-key", protect, getPublicKey);

router.put("/profile", protect, updateProfile);
router.put("/save/:postId", protect, toggleSavePost);
router.put("/:id/ban", protect, admin, toggleBanUser);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

router.delete("/:id", protect, admin, deleteUser);

export default router;
