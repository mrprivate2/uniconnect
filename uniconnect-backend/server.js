import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// 🔥 ADD THIS (VERY IMPORTANT)
app.use("/uploads", express.static("uploads"));

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 UniConnect Backend is Running Successfully!");
});

// ✅ Port setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});