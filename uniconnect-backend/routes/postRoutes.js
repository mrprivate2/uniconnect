import express from "express";
import multer from "multer";
import { 
  getPosts, 
  getPostsByType, 
  getPostsByUser,
  createPost, 
  likePost, 
  addComment, 
  getAllPostsAdmin, 
  deletePost,
  updatePost,
  applyToPost,
  getApplicants,
  getMyEventsWithApplicants
} from "../controllers/postController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   🔥 MULTER SETUP
========================= */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/mpeg", "video/quicktime", "video/webm"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Protocol only supports authorized images and videos."), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

/* =========================
   🛣 ROUTES
========================= */
router.route("/")
  .get((req, res, next) => {
    // Make protect optional for GET: if no token, just proceed without error
    if (req.headers.authorization) {
      return protect(req, res, next);
    }
    next();
  }, getPosts)
  .post(
    (req, res, next) => {
      console.log("📨 Incoming POST request to /api/posts");
      next();
    }, 
    upload.single("media"), 
    protect, 
    (req, res, next) => {
      console.log("📂 Multer + Protect processing complete.");
      if (req.file) {
        console.log("✅ File found by Multer:", req.file.originalname);
      } else {
        console.log("❌ No file found by Multer.");
      }
      next();
    }, 
    createPost
  );

router.get("/all", protect, admin, getAllPostsAdmin);
router.get("/my-management", protect, getMyEventsWithApplicants);
router.get("/type/:typeName", getPostsByType);
router.get("/user/:userId", protect, getPostsByUser);
router.get("/:id/applicants", protect, getApplicants);

router.put("/:id/like", protect, likePost);
router.post("/:id/comment", protect, addComment);
router.post("/:id/apply", protect, applyToPost);

router.route("/:id")
  .delete(protect, deletePost)
  .put(protect, updatePost);

router.get("/:id/applicants", protect, getApplicants);

export default router;
