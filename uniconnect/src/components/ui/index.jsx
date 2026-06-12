import React from "react";
import { motion } from "framer-motion";

export const Button = ({ children, onClick, className = "", variant = "primary", size = "md", disabled = false, icon: Icon }) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    outline: "bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} strokeWidth={2.5} />}
      {children}
    </motion.button>
  );
};

export const Card = ({ children, className = "", onClick }) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -5 } : {}}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-900/20 transition-all duration-500 ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
};

export const Input = ({ label, icon: Icon, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{label}</label>}
      <div className="relative group">
        {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />}
        <input
          {...props}
          className={`w-full bg-slate-50 border border-slate-100 rounded-2xl ${Icon ? 'pl-14' : 'px-6'} pr-6 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all shadow-sm ${className}`}
        />
      </div>
    </div>
  );
};
