import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Store, Settings, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ hideProfile = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/feed", icon: <Home className="w-6 h-6" />, label: "Feed" },
    { path: "/friends", icon: <Users className="w-6 h-6" />, label: "Friends" },
    { path: "/rent", icon: <Store className="w-6 h-6" />, label: "RentHub" },
    { path: "/settings", icon: <Settings className="w-6 h-6" />, label: "Settings" },
  ];

  if (!hideProfile) {
    navItems.push({
      path: "/profile",
      icon: <User className="w-6 h-6" />,
      label: "Profile",
    });
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 80 }}
      className="fixed bottom-0 left-0 right-0 z-40 
      bg-gradient-to-r from-purple-900 via-black to-purple-950 
      border-t border-purple-600/40 shadow-lg backdrop-blur-lg 
      flex justify-around items-center py-3"
    >
      {navItems.map(({ path, icon, label }) => {
        const isActive = location.pathname === path;

        return (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileTap={{ scale: 0.9 }}
            className="relative flex flex-col items-center text-xs transition-all duration-300"
          >
            {/* 🔥 Active Glow Background */}
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                className="absolute -top-1 w-12 h-12 bg-fuchsia-500/20 rounded-full blur-xl"
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
            )}

            {/* Icon */}
            <div
              className={`p-2 rounded-full transition-all ${
                isActive
                  ? "bg-purple-700/60 text-fuchsia-400 shadow-lg shadow-fuchsia-500/20"
                  : "text-gray-400 hover:text-fuchsia-300 hover:bg-purple-800/30"
              }`}
            >
              {icon}
            </div>

            {/* Label */}
            <span
              className={`mt-1 ${
                isActive ? "text-fuchsia-400 font-medium" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}