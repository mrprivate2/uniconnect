import express from "express";
import { login, register, forgotPassword, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/register", authLimiter, register);
router.post("/forgot-password", authLimiter, forgotPassword);
router.get("/me", protect, getMe);

export default router;
