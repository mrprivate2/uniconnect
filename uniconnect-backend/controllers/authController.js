import { supabase } from "../config/supabase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import { catchAsync } from "../middleware/catchAsync.js";

dotenv.config();

// 📧 Nodemailer Transporter (configured via env vars)
const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromName = process.env.EMAIL_FROM_NAME || 'UniConnect';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || user || 'noreply@uniconnect.app';

  if (!host || !user || !pass) {
    console.warn("⚠️ SMTP not configured. Password reset emails will be simulated (logged to console).");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

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
   ✅ FORGOT PASSWORD — Generate & send reset token
========================= */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.toLowerCase().trim();
  
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name")
    .eq("email", cleanEmail)
    .single();

  // Don't reveal whether the email exists for security
  if (error || !user) {
    // Still return success to prevent email enumeration
    return res.json({ message: "If that email is registered, a reset link has been transmitted." });
  }

  // Generate secure token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

  // Invalidate any existing tokens for this user
  await supabase
    .from("password_resets")
    .update({ used: true })
    .eq("user_id", user.id)
    .eq("used", false);

  // Store new token
  const { error: insertError } = await supabase
    .from("password_resets")
    .insert([{
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt.toISOString(),
      used: false
    }]);

  if (insertError) {
    console.error("❌ Failed to store reset token:", insertError);
    return res.json({ message: "If that email is registered, a reset link has been transmitted." });
  }

  // Build reset link
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

  // Send email via Nodemailer
  const transporter = createTransporter();
  
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'UniConnect'}" <${process.env.EMAIL_FROM || process.env.SMTP_FROM || 'noreply@uniconnect.app'}>`,
        to: cleanEmail,
        subject: "🔐 UniConnect — Password Reset Request",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.02em; color: #0F172A;">
                🔐 Uni<span style="color: #4F46E5;">Connect</span>
              </h1>
            </div>
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 8px;">
                Password Reset Request
              </h2>
              <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${user.name || 'there'},<br /><br />
                We received a request to reset your UniConnect password. 
                Click the button below to set a new password. This link expires in 1 hour.
              </p>
              <a href="${resetLink}" 
                 style="display: inline-block; background: #0F172A; color: #FFFFFF; 
                        padding: 14px 32px; border-radius: 12px; text-decoration: none; 
                        font-weight: 700; font-size: 14px;">
                Reset Password
              </a>
              <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Reset email sent to ${cleanEmail}`);
    } catch (mailError) {
      console.error("❌ Failed to send reset email:", mailError.message);
      // Token was stored, so the user can still get it via console in dev mode
    }
  } else {
    console.log(`⚠️ SMTP not configured. Reset link (dev mode): ${resetLink}`);
  }

  res.json({ message: "If that email is registered, a reset link has been transmitted." });
});

/* =========================
   ✅ VERIFY RESET TOKEN
========================= */
export const verifyResetToken = catchAsync(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ valid: false, error: "Token is required" });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const { data: resetRecord } = await supabase
    .from("password_resets")
    .select("*, user:users(id, name, email)")
    .eq("token", hashedToken)
    .eq("used", false)
    .single();

  if (!resetRecord) {
    return res.json({ valid: false, error: "Invalid or expired reset token" });
  }

  if (new Date(resetRecord.expires_at) < new Date()) {
    // Mark as expired
    await supabase.from("password_resets").update({ used: true }).eq("id", resetRecord.id);
    return res.json({ valid: false, error: "Reset token has expired" });
  }

  res.json({ 
    valid: true, 
    email: resetRecord.user?.email,
    name: resetRecord.user?.name
  });
});

/* =========================
   ✅ RESET PASSWORD
========================= */
export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const { data: resetRecord } = await supabase
    .from("password_resets")
    .select("*")
    .eq("token", hashedToken)
    .eq("used", false)
    .single();

  if (!resetRecord) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  if (new Date(resetRecord.expires_at) < new Date()) {
    await supabase.from("password_resets").update({ used: true }).eq("id", resetRecord.id);
    return res.status(400).json({ error: "Reset token has expired" });
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update user password
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", resetRecord.user_id);

  if (updateError) {
    throw updateError;
  }

  // Invalidate the token
  await supabase.from("password_resets").update({ used: true }).eq("id", resetRecord.id);

  res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
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
