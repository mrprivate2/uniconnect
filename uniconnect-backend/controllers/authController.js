import { supabase } from "../config/supabase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";
import { catchAsync } from "../middleware/catchAsync.js";

dotenv.config();

/* =========================
   ✅ USER REGISTER
========================= */
export const register = catchAsync(async (req, res) => {
  const { name, username, email, password, publicKey } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanUsername = username.trim();

  // 🔥 CHECK IF USER ALREADY EXISTS (Supabase)
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("email, username")
    .or(`email.eq.${cleanEmail},username.eq.${cleanUsername}`)
    .single();

  if (existingUser) {
    return res.status(400).json({ 
      error: existingUser.email === cleanEmail 
        ? "Email already registered" 
        : "Username already taken" 
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userId = uuidv4();

  const { data: user, error: insertError } = await supabase
    .from("users")
    .insert([
      {
        id: userId,
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        public_key: publicKey || "",
        role: "user"
      }
    ])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(201).json({
    token,
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
    },
  });
});

/* =========================
   ✅ USER LOGIN
========================= */
export const login = catchAsync(async (req, res) => {
  const { email, username, password } = req.body;
  const loginId = email || username;

  if (!loginId || !password) {
    return res.status(400).json({ error: "Email/Username and password are required" });
  }

  const cleanId = loginId.trim();
  console.log(`Attempting login for: ${cleanId}`);

  // 🔥 FIND USER (Supabase)
  const { data: user, error: findError } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${cleanId.toLowerCase()},username.eq.${cleanId}`)
    .single();

  if (findError || !user) {
    console.log(`❌ Login failed: User not found (${loginId})`);
    return res.status(401).json({ error: "Invalid email/username or password" });
  }

  // 🔐 CHECK PASSWORD
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log(`❌ Login failed: Password mismatch for ${loginId}`);
    return res.status(401).json({ error: "Invalid email/username or password" });
  }

  // 🚫 CHECK BAN STATUS
  if (user.is_banned) {
    console.log(`🚫 Login denied: User ${user.username} is banned.`);
    return res.status(403).json({ error: "Your account has been suspended. Please contact administration." });
  }

  // 🎫 GENERATE TOKEN
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  console.log(`✅ Login successful: ${user.username} (${user.role})`);

  res.json({
    token,
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
    },
  });
});

/* =========================
   ✅ FORGOT PASSWORD
========================= */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: "No user found with this email" });
  }
  res.json({ message: "Reset link sent to " + email });
});

/* =========================
   ✅ GET CURRENT USER (ME)
========================= */
export const getMe = catchAsync(async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, username, email, role, avatar, bio, college_id, is_private")
    .eq("id", req.user.id)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    _id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    college_id: user.college_id,
    isPrivate: user.is_private
  });
});
