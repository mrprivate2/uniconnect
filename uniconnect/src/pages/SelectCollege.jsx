import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, GraduationCap, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";

// 🛸 STEALTH INTERCEPTOR DRONE COMPONENT (Pure Code)
const StealthDrone = ({ delay = 0 }) => (
    <motion.div
      initial={{ x: "-20vw", y: "80vh", opacity: 0, scale: 0.5, rotate: -15 }}
      animate={{ 
        x: ["-20vw", "50vw", "120vw"], 
        y: ["80vh", "45vh", "10vh"], 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 0.8, 0.5],
      }}
      transition={{ 
        duration: 18, 
        repeat: Infinity, 
        ease: "linear",
        delay: delay
      }}
      className="absolute pointer-events-none z-[5]"
    >
      <div className="relative group">
        {/* Glow / Engine Wash */}
        <div className="absolute -inset-10 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -inset-4 bg-red-600/10 rounded-full blur-xl animate-pulse" />
        
        <svg width="240" height="100" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Stealth Wing Body */}
          <path d="M60 5L110 35H10L60 5Z" fill="#0f172a" />
          <path d="M60 5L90 35H30L60 5Z" fill="#1e293b" />
          
          {/* Active Scanner Laser */}
          <motion.rect 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            x="58" y="10" width="4" height="2" rx="1" fill="#ef4444" 
            className="shadow-[0_0_10px_#ef4444]"
          />
          
          {/* Engine Exhausts */}
          <circle cx="45" cy="35" r="3" fill="#3b82f6" className="animate-pulse" />
          <circle cx="75" cy="35" r="3" fill="#3b82f6" className="animate-pulse" />
          
          {/* Details */}
          <path d="M40 35L60 15L80 35" stroke="#334155" strokeWidth="0.5" />
        </svg>
      </div>
    </motion.div>
);

export default function SelectCollege({ onSelect }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingColleges, setLoadingColleges] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/colleges`);
        setColleges(res.data);
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  const filteredColleges = useMemo(() => {
    return colleges.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, colleges]);

  const handleNext = async () => {
    if (selected) {
      const token = localStorage.getItem("token");
      if (user?.isGuest || !token) {
        updateUser({ college: selected.name, college_id: selected._id });
        onSelect(selected.name);
        navigate("/feed");
        return;
      }
      try {
        const res = await axios.put(`${API_BASE_URL}/users/profile`, {
          college: selected._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        updateUser({ college: res.data.college, college_id: res.data.college });
        onSelect(selected.name);
        navigate("/feed");
      } catch (err) {
        onSelect(selected.name);
        navigate("/feed");
      }
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans selection:bg-blue-100 bg-mesh text-slate-900 relative">
      
      {/* 🛸 STEALTH INTERCEPTOR ANIMATIONS */}
      <StealthDrone delay={0} />
      <StealthDrone delay={9} />

      {/* BACKGROUND MESH GRADIENTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px]"
        />
      </div>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[400px] bg-white/80 backdrop-blur-xl relative flex-col justify-between p-12 overflow-hidden border-r border-blue-50 shrink-0 z-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                <ShieldCheck className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic">Uni<span className="text-blue-600">Connect</span></span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-100/50">
                Network Authorization
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
              Identify your<br />
              <span className="text-blue-600">Campus Hub.</span>
            </h1>
            
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">
               Select your university node to synchronize your encrypted communication channel.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
            <div className="p-6 bg-white/50 rounded-[2rem] border border-blue-50">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                        <Sparkles className="text-blue-600" size={14} />
                    </div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Status</p>
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                    Connected to regional backbone. Global node synchronization active and secured.
                </p>
            </div>
            <footer className="mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                Verified Instance © 2026
            </footer>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 overflow-y-auto no-scrollbar">
        <motion.div 
          className="w-full max-w-[480px] bg-white rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.02)] border border-blue-50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Node Selection</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Access University Hub</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                <GraduationCap size={24} />
            </div>
          </div>

          <div className="relative group mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2 h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
            <AnimatePresence mode="popLayout">
              {loadingColleges ? (
                <div className="py-24 text-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">Updating Network List...</p>
                </div>
              ) : filteredColleges.length > 0 ? (
                filteredColleges.map((college) => (
                  <motion.button
                    layout
                    key={college._id}
                    onClick={() => setSelected(college)}
                    className={`w-full flex items-center justify-between py-4 px-6 rounded-2xl border-2 transition-all duration-300 ${
                      selected?._id === college._id
                        ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100"
                        : "border-transparent bg-slate-50 hover:bg-slate-100/50 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selected?._id === college._id ? "bg-white/20 text-white" : "bg-white text-slate-300 shadow-sm"}`}>
                            <GraduationCap size={16} strokeWidth={2.5} />
                        </div>
                        <span className={`text-xs ${selected?._id === college._id ? "font-black" : "font-bold"}`}>
                            {college.name}
                        </span>
                    </div>
                    {selected?._id === college._id && (
                        <CheckCircle2 className="text-white w-4 h-4" strokeWidth={3} />
                    )}
                  </motion.button>
                ))
              ) : (
                <div className="py-24 text-center">
                    <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">No results found</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleNext}
            disabled={!selected}
            className={`w-full py-5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 ${
              selected
                ? "bg-slate-900 hover:bg-black shadow-slate-200"
                : "bg-slate-200 cursor-not-allowed text-slate-400 shadow-none"
            }`}
          >
            Authorize Connection <ArrowRight size={14} strokeWidth={3} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
