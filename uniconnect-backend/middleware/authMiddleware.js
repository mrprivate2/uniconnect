import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from "../config/supabase.js";

dotenv.config();

/* =========================
   🛡 PROTECT ROUTE
========================= */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token || token === "null" || token === "undefined") {
        console.error("❌ Auth Error: Token is null or undefined string");
        return res.status(401).json({ error: "Not authorized, invalid token format" });
      }

      // 🔥 DECODE TOKEN
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 👤 GET USER FROM DB (Supabase)
      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, email, role, name, bio, avatar, college_id, is_private, public_key")
        .eq("id", decoded.id)
        .single();

      if (error) {
        console.error("❌ Supabase Auth Error:", error.message);
        return res.status(401).json({ error: "Authentication database error" });
      }

      if (!user) {
        console.error(`❌ Auth Error: User not found for ID ${decoded.id}`);
        return res.status(401).json({ error: "User not found or not authorized" });
      }

      req.user = {
        _id: user.id,
        ...user
      };

      return next();
    } catch (error) {
      console.error("❌ JWT Verification Failed:", error.message);
      return res.status(401).json({ error: `Not authorized, token failed: ${error.message}` });
    }
  }

  if (!token) {
    console.error("❌ Auth Error: No token provided in headers");
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

/* =========================
   🛡 ADMIN ONLY
========================= */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    console.log(`🛡 Admin access granted for: ${req.user.username}`);
    return next();
  } else {
    console.log(`🚫 Admin access denied for: ${req.user?.username || 'Unknown'} (Role: ${req.user?.role || 'None'})`);
    return res.status(403).json({ error: "Not authorized as an admin" });
  }
};
