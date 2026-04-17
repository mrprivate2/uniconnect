import express from "express";
import multer from "multer";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();


// 🔥 MULTER SETUP
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// ✅ 1. Fetch all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 2. Fetch rent items
router.get("/rent", async (req, res) => {
  try {
    const rentItems = await Post.find({ type: "rent" }).sort({ createdAt: -1 });
    res.json(rentItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 3. CREATE POST (🔥 FIXED WITH MULTER)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { content, author, type, title, price } = req.body;

    console.log("FILE:", req.file); // debug

    // Find user
    let user = null;
    if (author) {
      user = await User.findOne({ username: author });
    } else {
      user = await User.findOne();
    }

    const newPost = new Post({
      content,
      author: user ? user._id : null,
      type: type || "post",
      title,
      price,

      // 🔥 IMPORTANT
      image: req.file ? `/uploads/${req.file.filename}` : null,

      createdAt: new Date(),
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ 4. Like
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes = (post.likes || 0) + 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 5. Delete
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;