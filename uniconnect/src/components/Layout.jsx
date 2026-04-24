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
    <div className="bg-mesh text-slate-900 h-screen font-sans selection:bg-indigo-100 flex flex-col overflow-hidden">
      
      {/* PROFESSIONAL COMPACT HEADER */}
      <header className="flex-shrink-0 z-[100] w-full bg-white border-b border-slate-200 px-4 md:px-8 py-1.5 flex items-center justify-between shadow-sm h-[45px]">
        {/* LOGO AREA */}
        <div 
          onClick={() => navigate("/feed")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-600 transition-colors">
            <Sparkles size={16} className="text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
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
