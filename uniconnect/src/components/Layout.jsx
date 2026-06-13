import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Navbar from "./Navbar";
import TopButtons from "./TopButtons";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="bg-mesh text-slate-900 dark:text-slate-100 h-screen font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 flex flex-col overflow-hidden">
      
      {/* PROFESSIONAL COMPACT HEADER */}
      <header className="flex-shrink-0 z-[100] w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-8 py-1.5 flex items-center justify-between shadow-sm dark:shadow-slate-900/50 h-[45px]">
        {/* LOGO AREA */}
        <div 
          onClick={() => navigate("/feed")}
          className="flex items-center gap-1 sm:gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-600 transition-colors">
            <Sparkles size={16} className="text-white" fill="white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            UniConnect<span className="text-indigo-600">.</span>
          </span>
        </div>

        {/* TOP UTILITY HUB */}
        <div className="flex items-center h-full">
            <TopButtons />
        </div>
      </header>

      <Navbar />
      
      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
