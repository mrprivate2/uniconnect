import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email.trim()) {
      alert("Please enter your Gmail address");
      return;
    }
    onLogin({ name: email.split("@")[0], email });
    navigate("/select-college");
  };

  const handleGuestLogin = () => {
    onLogin({ name: "Guest User", email: "guest@gmail.com" });
    navigate("/select-college");
  };

  const handleAdminLogin = () => {
    onLogin({ name: "Admin", email: "admin@uniconnect.com", role: "admin" });
    navigate("/select-college");
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Logo */}
      <motion.h1
        className="text-6xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        UniConnect
      </motion.h1>

      {/* Login Card */}
      <motion.div
        className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-80 flex flex-col items-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <label className="w-full text-left mb-2 text-gray-300 font-medium">
          Gmail Address
        </label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
        />

        <button
          onClick={handleLogin}
          className="mt-5 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          Continue with Gmail
        </button>

        <div className="my-4 text-gray-400 text-sm">— OR —</div>

        <button
          onClick={handleGuestLogin}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          Continue as Guest
        </button>

        <button
          onClick={handleAdminLogin}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          Login as Admin
        </button>
      </motion.div>

      <p className="mt-10 text-gray-400 text-sm">© 2025 UniConnect</p>
    </motion.div>
  );
}
