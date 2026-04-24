import express from "express";
import {
  getColleges,
  createCollege,
  getCollegeById,
  deleteCollege,
} from "../controllers/collegeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   ✅ GET ALL COLLEGES
========================= */
router.get("/", getColleges);

/* =========================
   ✅ CREATE COLLEGE (ADMIN)
========================= */
router.post("/", protect, admin, createCollege);

/* =========================
   ✅ GET BY ID
========================= */
router.get("/:id", getCollegeById);

/* =========================
   ❌ DELETE (ADMIN)
========================= */
router.delete("/:id", protect, admin, deleteCollege);

export default router;
