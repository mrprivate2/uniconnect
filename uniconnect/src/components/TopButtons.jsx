import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TopButtons() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChat = () => navigate("/chat");
  const handleCreatePost = () => navigate("/create");

  // Hide on login and college selection pages
  if (location.pathname === "/" || location.pathname === "/select-college") return null;

  const isCreatePage = location.pathname === "/create";

  return (
    <>
      {/* 🔥 Chat Button (Top Right) */}
      <motion.button
        onClick={handleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-5 
        bg-purple-700/80 backdrop-blur-md 
        hover:bg-purple-600 
        p-3 rounded-full shadow-lg 
        border border-purple-400/30 
        transition-all z-50 group"
      >
        <MessageCircle className="text-white w-6 h-6" />

        {/* Tooltip */}
        <span className="absolute right-14 top-1/2 -translate-y-1/2 
        bg-black/70 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
          Chat
        </span>
      </motion.button>

      {/* 🔥 Floating Create Button */}
      <motion.button
        onClick={handleCreatePost}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -6, 0], // floating effect
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`fixed bottom-20 right-6 
        p-4 rounded-full shadow-2xl 
        transition-all z-40 group
        ${
          isCreatePage
            ? "bg-fuchsia-500 shadow-fuchsia-500/40"
            : "bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-purple-500/40"
        }`}
      >
        <Plus className="w-6 h-6 text-white" />

        {/* Tooltip */}
        <span className="absolute right-16 bottom-1/2 translate-y-1/2 
        bg-black/70 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
          Create
        </span>
      </motion.button>
    </>
  );
}