import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Briefcase, User, Plus } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

export default function UniConnectNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const mouseX = useMotionValue(Infinity);

  const navItems = [
    { path: "/feed", icon: Home, label: "FEED" },
    { path: "/findfriends", icon: Users, label: "NETWORK" },
    { path: "/recruitment", icon: Briefcase, label: "CAREERS" },
    { path: "/profile", icon: User, label: "PROFILE" },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-4 w-full max-w-fit">
      <motion.nav
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-slate-900/50"
      >
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.slice(0, 2).map((item) => (
            <ContextNavItem
              key={item.label}
              mouseX={mouseX}
              {...item}
              isActive={location.pathname === item.path}
              navigate={navigate}
            />
          ))}
        </div>

        <div className="px-0.5 sm:px-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create")}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.slice(2).map((item) => (
            <ContextNavItem
              key={item.label}
              mouseX={mouseX}
              {...item}
              isActive={location.pathname === item.path}
              navigate={navigate}
            />
          ))}
        </div>
      </motion.nav>
    </div>
  );
}

function ContextNavItem({
  mouseX,
  path,
  icon: Icon,
  label,
  isActive,
  navigate
}) {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const scaleSync = useTransform(distance, [-100, 0, 100], [1, 1.05, 1]);
  const scale = useSpring(scaleSync, { stiffness: 300, damping: 20 });

  return (
    <motion.button
      ref={ref}
      style={{ scale: isActive ? 1 : scale }}
      onClick={() => navigate(path)}
      className={`relative flex items-center transition-all duration-200 ${
          isActive
          ? "px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white"
          : "px-2 sm:px-3 py-2 sm:py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
      }`}
    >
      <div className="flex items-center gap-1 sm:gap-2 relative z-10">
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="hidden sm:inline text-[10px] font-bold tracking-wider overflow-hidden whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
