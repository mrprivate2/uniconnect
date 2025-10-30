import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TopButtons() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChat = () => {
    navigate("/chat");
  };

  const handleCreatePost = () => {
    navigate("/create");
  };

  // Hide on login and college selection pages
  if (location.pathname === "/" || location.pathname === "/select-college") return null;

  return (
    <>
      {/* Chat button (top-right corner) */}
      <motion.button
        onClick={handleChat}
        whileTap={{ scale: 0.9 }}
        className="fixed top-4 right-5 bg-purple-600 hover:bg-purple-700 p-3 rounded-full shadow-lg transition-all z-50"
      >
        <MessageCircle className="text-white w-6 h-6" />
      </motion.button>

      {/* Create post button (bottom-right above navbar) */}
      <motion.button
        onClick={handleCreatePost}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-6 bg-gradient-to-r from-purple-700 to-purple-500 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-600/50 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </>
  );
}
