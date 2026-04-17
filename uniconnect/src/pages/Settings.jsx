import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Settings() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("uni_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
    localStorage.setItem("uni_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("uni_college");
      window.location.href = "/";
    }
  };

  return (
    <motion.div
      className="min-h-[85vh] bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        Settings ⚙️
      </h1>

      <div className="max-w-xl mx-auto space-y-5">

        {/* 🔥 Theme Card */}
        <div className="bg-purple-800/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-lg">
          <h3 className="font-semibold text-lg mb-3">Theme</h3>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">
              {theme === "dark" ? "Dark Mode 🌙" : "Light Mode ☀️"}
            </span>

            {/* 🔥 Toggle Switch */}
            <button
              onClick={toggleTheme}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
                theme === "dark" ? "bg-purple-600" : "bg-gray-400"
              }`}
            >
              <motion.div
                layout
                className="w-5 h-5 bg-white rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                  marginLeft: theme === "dark" ? "auto" : "0",
                }}
              />
            </button>
          </div>
        </div>

        {/* 🔥 About */}
        <div className="bg-purple-800/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-lg">
          <h3 className="font-semibold text-lg mb-2">
            About UniConnect
          </h3>
          <p className="text-sm text-gray-300">
            UniConnect is a campus-first social platform built for students to connect,
            collaborate, and grow together 🚀
          </p>
        </div>

        {/* 🔥 Logout */}
        <div className="bg-purple-800/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-lg">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
          >
            Logout
          </button>
        </div>

      </div>
    </motion.div>
  );
}