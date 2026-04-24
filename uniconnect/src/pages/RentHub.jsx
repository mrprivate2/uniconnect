import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingBag, Heart, ArrowLeft, Tag, MapPin, Sparkles, Filter, Package, Zap, LayoutGrid, Calendar, Store, Briefcase } from "lucide-react";
import API_BASE_URL from "../api";
import { getMediaUrl } from "../utils/media";
import ContentModal from "../components/ContentModal";

export default function RentHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      return [];
    }
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/posts/type/rent`);
      setItems(res.data || []);
      localStorage.setItem("rent_cache", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      const cache = localStorage.getItem("rent_cache");
      if (cache) setItems(JSON.parse(cache));
      else setError("Failed to load marketplace items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    let data = [...items];
    if (search) {
      data = data.filter((item) =>
        item.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sort === "low") data.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === "high") data.sort((a, b) => (b.price || 0) - (a.price || 0));
    return data;
  }, [items, search, sort]);

  const toggleFavorite = (id) => {
    let updated = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleUpdateContent = (updated) => {
    setItems(prev => prev.map(i => i._id === updated._id ? updated : i));
    if (selected?._id === updated._id) setSelected(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-indigo-600 bg-mesh text-slate-900">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-100" />
        <p className="font-black text-[10px] uppercase tracking-[0.4em]">Initializing Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-40 overflow-x-hidden bg-mesh font-sans text-slate-900">
      
      <div className="relative z-10 p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto">
        
        {/* FILTER TABS */}
        <div className="flex gap-4 mb-14 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: "All Posts", label: "All Posts", icon: LayoutGrid, path: "/feed" },
            { id: "Events", label: "Events", icon: Calendar, path: "/feed" },
            { id: "Recruitment", label: "Recruitment", icon: Briefcase, path: "/feed" },
            { id: "Market", label: "Market", icon: Store, active: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.path) {
                  navigate(tab.path, { state: { activeTab: tab.id } });
                }
              }}
              className={`px-8 py-5 rounded-[2rem] text-[10px] font-black tracking-[0.2em] transition-all duration-500 uppercase flex items-center gap-3 group ${
                tab.active
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-200 -translate-y-1"
                  : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100 hover:shadow-lg shadow-sm hover:-translate-y-0.5"
              }`}
            >
              <tab.icon size={16} className={`${tab.active ? "text-indigo-400" : "text-slate-300 group-hover:text-indigo-400"} transition-colors`} />
              {tab.label}
            </button>
          ))}
        </div>

        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100">
                <Sparkles size={10} fill="currentColor" /> Campus Trading
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Market<span className="text-gradient">Place.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">SECURE RENTALS & PEER-TO-PEER COMMERCE</p>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative group flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search items for rent or sale..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-slate-100 rounded-[1.5rem] pl-14 pr-8 py-5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 w-full shadow-sm transition-all text-slate-700"
              />
            </div>
            <button className="p-5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all">
                <Filter size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {selected ? (
            <ContentModal 
                content={selected} 
                onClose={() => setSelected(null)} 
                onUpdate={handleUpdateContent}
            />
          ) : (
            <>
              {filteredItems.length === 0 ? (
                <div className="py-40 text-center flex flex-col items-center gap-8">
                  <div className="w-32 h-32 bg-white rounded-[3.5rem] flex items-center justify-center text-slate-100 shadow-2xl border border-slate-50">
                    <ShoppingBag size={60} strokeWidth={1} />
                  </div>
                  <p className="text-slate-300 font-black text-xs uppercase tracking-[0.4em]">No artifacts found in current sector</p>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10 space-y-10">
                  {filteredItems.map((item) => (
                    <motion.div
                      layout
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -10 }}
                      onClick={() => setSelected(item)}
                      className="break-inside-avoid cursor-pointer group"
                    >
                      <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 relative">
                        <div className="relative aspect-[5/6] overflow-hidden">
                          <img
                            src={getMediaUrl(item.image)}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(item._id); }}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all shadow-xl border border-white"
                          >
                            <Heart size={20} fill={favorites.includes(item._id) ? "currentColor" : "none"} className={favorites.includes(item._id) ? "text-rose-500" : ""} />
                          </button>

                          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end translate-y-10 group-hover:translate-y-0 transition-transform duration-700">
                             <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Campus Spot</p>
                                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                                    <MapPin size={10} className="text-indigo-500" /> CU-H6
                                </div>
                             </div>
                          </div>
                        </div>

                        <div className="p-10">
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight mb-2">{item.title}</h3>
                          <p className="text-xs text-slate-400 font-medium line-clamp-1 mb-8">Premium student resources for rent</p>
                          
                          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5">DAILY RATE</span>
                              <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{item.price}</span>
                            </div>
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-100 group-hover:border-indigo-500 shadow-sm group-hover:shadow-indigo-200">
                              <ShoppingBag size={24} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .break-inside-avoid { break-inside: avoid-column; }
      `}</style>
    </div>
  );
}
