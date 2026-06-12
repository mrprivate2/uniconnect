// 🚀 UniConnect Recruitment Module - Updated 2026-04-24
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Briefcase, Plus, Filter, MapPin, 
  Calendar, Users, Building2, LayoutGrid, Sparkles,
  ArrowRight, ShieldCheck, Zap, Globe, Clock, MessageSquare, Cpu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import ContentModal from "../components/ContentModal";

// 🌌 AESTHETIC BACKGROUND (Floating Orbs & Aurora)
const AestheticBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
            animate={{ x: [-50, 50, -50], y: [-20, 20, -20], scale: [1, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-400/5 rounded-full blur-[100px]"
        />
        <motion.div 
            animate={{ x: [50, -50, 50], y: [20, -20, 20], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-400/5 rounded-full blur-[100px]"
        />
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ x: `${Math.random() * 100}vw`, y: "110vh", opacity: 0 }}
                animate={{ y: "-10vh", opacity: [0, 0.1, 0.1, 0] }}
                transition={{ duration: Math.random() * 10 + 20, repeat: Infinity, ease: "linear", delay: -Math.random() * 20 }}
                className="absolute w-40 h-40 rounded-full bg-white/5 border border-white/10 backdrop-blur-[2px]"
            />
        ))}
    </div>
);

export default function Recruitment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_BASE_URL}/posts?type=recruitment`);
        setListings(res.data.filter(p => p.type === 'recruitment'));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleUpdateContent = (updated) => {
    setListings(prev => prev.map(l => l._id === updated._id ? updated : l));
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || (item.category === activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-mesh font-sans text-slate-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-blue-100 dark:selection:bg-blue-900/50">
      <AestheticBackground />

      <main className="max-w-6xl mx-auto pt-4 pb-20 px-6 relative z-10">
        
        {/* --- COMPACT DASHBOARD HEADER --- */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-blue-50 dark:border-slate-700 shadow-xl shadow-blue-500/5 dark:shadow-slate-900 mb-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest mb-3">
                    <Zap size={12} fill="currentColor" /> Live Grid
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Opportunities</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Found {listings.length} active nodes</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 dark:text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Filter signals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <button 
                    onClick={() => navigate("/create")}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-black dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-slate-900"
                >
                    <Plus size={14} strokeWidth={3} /> Post
                </button>
            </div>
        </div>

        {/* --- COMPACT FILTERS & CONTENT --- */}
        <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Filters (Visible on desktop) */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] p-6 border border-blue-50 dark:border-slate-700 shadow-sm dark:shadow-slate-900">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">System Sectors</h3>
                    <div className="flex flex-col gap-2">
                        {["All", "Technology", "Design", "Hackathons", "Business", "Academic"].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between group ${
                                    activeFilter === filter 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900" 
                                    : "text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                                }`}
                            >
                                {filter}
                                {activeFilter === filter && <Zap size={10} fill="currentColor" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Node Card */}
                <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-2">Network Tip</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                            Filter by <span className="text-blue-600 dark:text-blue-400">Hackathons</span> to find specialized build-teams for upcoming campus events.
                        </p>
                    </div>
                    <Cpu className="absolute -bottom-4 -right-4 w-16 h-16 text-blue-100 dark:text-blue-800/50" />
                </div>
            </div>

            {/* Main Listings Grid (Now more compact) */}
            <div className="lg:col-span-3">
                {isLoading ? (
                    <div className="h-96 flex flex-col items-center justify-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-white dark:border-slate-700">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.4em]">Decoding Grid...</p>
                    </div>
                ) : filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredListings.map((job) => (
                            <ListingCard key={job._id} job={job} onClick={() => setSelectedJob(job)} />
                        ))}
                    </div>
                ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-dashed border-blue-100 dark:border-slate-700">
                        <Briefcase size={32} className="text-slate-200 dark:text-slate-600 mb-4" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">No nodes found</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">Try resetting sectors</p>
                    </div>
                )}
            </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedJob && (
            <ContentModal 
                content={selectedJob} 
                onClose={() => setSelectedJob(null)} 
                onUpdate={handleUpdateContent}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

function ListingCard({ job, onClick }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-900 dark:text-slate-200 border border-slate-100 dark:border-slate-600 group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:text-white dark:group-hover:text-white transition-colors">
            <Building2 size={20} />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{job.category || "General"}</span>
                <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Open</span>
                </div>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed">
                {job.content}
            </p>
            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-slate-300 dark:text-slate-500" />
                    <span className="text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Campus</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock size={10} className="text-slate-300 dark:text-slate-500" />
                    <span className="text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">New</span>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
    const colors = {
        blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50 shadow-blue-100/50 dark:shadow-blue-900/50",
        sky: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/50 shadow-sky-100/50 dark:shadow-sky-900/50",
        indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 shadow-indigo-100/50 dark:shadow-indigo-900/50",
        emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50 shadow-emerald-50 dark:shadow-emerald-900/50"
    };
    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900 flex flex-col gap-6"
        >
            <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center border shadow-lg`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{value}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
        </motion.div>
    );
}
