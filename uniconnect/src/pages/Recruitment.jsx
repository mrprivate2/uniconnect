import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Briefcase, Plus, Filter, MapPin, 
  Calendar, Users, Building2, LayoutGrid, Sparkles,
  ArrowRight, ShieldCheck, Zap, Globe, Clock, MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import ContentModal from "../components/ContentModal";

export default function Recruitment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  const token = localStorage.getItem("token");

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
    <div className="min-h-screen pb-40 bg-mesh font-sans text-slate-900">
      <main className="max-w-[1400px] mx-auto p-8 md:p-16">
        
        {/* ENHANCED HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
                <Zap size={12} fill="currentColor" /> Career Node Synchronization
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
              Recruitment<br />
              <span className="text-indigo-600">Protocol.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Accelerate your trajectory. Connect with elite campus teams, research squads, and industry-disrupting startups.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text"
                placeholder="Query roles, skills, sectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all shadow-sm"
              />
            </div>
            <button 
                onClick={() => navigate("/create")}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 shrink-0"
            >
                <Plus size={16} strokeWidth={3} /> Post Listing
            </button>
          </div>
        </div>

        {/* QUICK STATS / NETWORK INSIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <StatBox label="Active Opportunities" value={listings.length} icon={Briefcase} color="indigo" />
            <StatBox label="Sector Hubs" value="12" icon={Building2} color="sky" />
            <StatBox label="Network Growth" value="+24%" icon={Zap} color="amber" />
            <StatBox label="Verified Nodes" value="482" icon={ShieldCheck} color="emerald" />
        </div>

        {/* LISTINGS FILTER & CONTROL */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
            {["All", "Technology", "Design", "Business", "Research"].map(filter => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeFilter === filter 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>

        {/* LISTINGS AREA */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white/50 backdrop-blur-xl rounded-[4rem] border border-white shadow-xl">
             <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8 shadow-xl shadow-indigo-100" />
             <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Scanning University Nodes...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((job) => (
              <ListingCard key={job._id} job={job} onClick={() => setSelectedJob(job)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-white/50 backdrop-blur-xl rounded-[4rem] border border-white shadow-xl">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-slate-50 mb-8 text-slate-100">
              <Briefcase size={60} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Zero opportunities in current sector</h3>
            <p className="text-slate-400 font-medium uppercase tracking-[0.3em] text-[10px]">Monitoring for new transmissions...</p>
          </div>
        )}

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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.02)] transition-all duration-700 relative overflow-hidden group cursor-pointer"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-sm">
           <Building2 size={28} strokeWidth={2} />
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100/50">
                {job.category || "Active Node"}
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live</span>
            </div>
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">{job.title}</h3>
      <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-8 line-clamp-3">
        {job.content}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-10 pt-8 border-t border-slate-50 relative z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={14} /></div>
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Hybrid</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={14} /></div>
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Apply Soon</span>
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2 group/btn">
            Initiate Protocol <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
        <button onClick={(e) => e.stopPropagation()} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-white hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all shadow-sm">
            <MessageSquare size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
        sky: "bg-sky-50 text-sky-600 border-sky-100 shadow-sky-100/50",
        amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50"
    };
    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6"
        >
            <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center border shadow-lg`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </motion.div>
    );
}
