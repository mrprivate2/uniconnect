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

  // Profile added conditionally
  if (!hideProfile) {
    navItems.push({ path: "/profile", icon: <User className="w-6 h-6" />, label: "Profile" });
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 80 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900 via-black to-purple-950 
      border-t border-purple-600/40 shadow-lg backdrop-blur-lg flex justify-around items-center py-3"
    >
      {navItems.map(({ path, icon, label }) => {
        const isActive = location.pathname === path;

        return (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center text-xs transition-all duration-300 ${
              isActive ? "text-fuchsia-400" : "text-gray-400 hover:text-fuchsia-300"
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                isActive ? "bg-purple-800/50 shadow-md" : "hover:bg-purple-800/30"
              }`}
            >
              {icon}
            </div>
            <span className="mt-1">{label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
