import "./config/loadEnv.js";
// ✅ Validate Environment Variables
const validateEnv = () => {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  const missing = [];
  if (!url) missing.push("VITE_SUPABASE_URL or SUPABASE_URL");
  if (!key) missing.push("VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");
  if (!jwtSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    console.error(`❌ CRITICAL ERROR: Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
};
validateEnv();

import express from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { Server } from "socket.io";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";

import { supabase } from "./config/supabase.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Connect to Database
// connectDB(); // Removed MongoDB

const app = express();
const server = http.createServer(app);

// =========================
// 🔥 SOCKET.IO SETUP
// =========================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  },
});

// Socket Auth Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.id;
    next();
  });
});

app.set("io", io);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);
  socket.join(userId);
  io.emit("online_users", Array.from(onlineUsers.keys()));

  socket.on("send_message", async ({ receiverId, text }) => {
    if (!receiverId) return;
    try {
      const { data: newMessage, error } = await supabase
        .from("messages")
        .insert([{
          sender_id: userId,
          receiver_id: receiverId,
          text,
        }])
        .select()
        .single();

      if (error) throw error;

      const messageData = { 
        senderId: userId, 
        text, 
        time: new Date(), 
        _id: newMessage.id 
      };
      io.to(receiverId).emit("receive_message", messageData);
      io.to(userId).emit("receive_message", messageData);
    } catch (err) {
      console.error("❌ Socket Error:", err);
    }
  });

  socket.on("typing", ({ receiverId, isTyping, senderName }) => {
    io.to(receiverId).emit("user_typing", { senderId: userId, isTyping, senderName });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

// =========================
// ✅ MIDDLEWARE
// =========================
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow if no origin (like mobile apps/curl)
    if (!origin) return callback(null, true);

    // 2. Check if it's in our allowed list or is a Vercel deployment
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith(".vercel.app") || 
                      allowedOrigins.includes("*");

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`❌ CORS Error: Origin ${origin} not allowed by config.`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP, please try again later."
});
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
});
app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);

// =========================
// 📁 STATIC FILES
// =========================
// Removed local uploads - using Supabase Storage

// =========================
// 🛣 ROUTES
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/friends", followRoutes); // Add this alias for the frontend

app.get("/", (req, res) => {
  res.send("🚀 UniConnect API is Running...");
});

// =========================
// 🚨 ERROR HANDLING
// =========================
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
