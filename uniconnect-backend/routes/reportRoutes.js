import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getReports, reportPost, resolveReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", protect, admin, getReports);
router.post("/", protect, reportPost);
router.put("/:id/resolve", protect, admin, resolveReport);

export default router;
