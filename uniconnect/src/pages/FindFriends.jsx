import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Search, UserPlus, Check, Users, ShieldCheck, Sparkles, ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";

// 🌌 Aesthetic Background
const AestheticBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
            animate={{ x: [-50, 50, -50], y: [-20, 20, -20], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]"
        />
        <motion.div 
            animate={{ x: [50, -50, 50], y: [20, -20, 20], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/10 rounded-full blur-[120px]"
        />
        {[...Array(6)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`, opacity: 0 }}
                animate={{ y: ["110vh", "-10vh"], x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`], opacity: [0, 0.15, 0.15, 0] }}
                transition={{ duration: Math.random() * 20 + 30, repeat: Infinity, ease: "linear", delay: -Math.random() * 30 }}
                className="absolute rounded-full bg-white/5 border border-white/10 backdrop-blur-[4px] shadow-2xl"
                style={{ width: `${Math.random() * 200 + 100}px`, height: `${Math.random() * 200 + 100}px` }}
            />
        ))}
    </div>
);

// 🎯 Stagger Variants
const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 22, mass: 0.8 },
    },
};

const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const rightSidebarVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 } },
};

export default function FindFriends() {
  const { user } = useAuth();
  const [peers, setPeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");
  const collegeName = user.college?.name || user.college || "Your University";

  useEffect(() => {
    const getPeers = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }); 
        setPeers(data.filter(u => u._id !== user._id));
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) getPeers();
  }, [token, user._id]);

  const handleConnect = async (peerId) => {
    setSentRequests(prev => [...prev, peerId]);
    try {
      await axios.post(`${API_BASE_URL}/friends/${peerId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setSentRequests(prev => prev.filter(id => id !== peerId));
    }
  };

  const displayFriends = useMemo(() => {
    return peers.filter(f => 
      (f.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (f.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [peers, searchTerm]);

  const resultCount = displayFriends.length;

  return (
    <div className="min-h-screen pb-40 px-4 font-sans bg-mesh text-slate-900 dark:text-slate-100 relative overflow-hidden selection:bg-blue-100 dark:selection:bg-blue-900/50">
      <AestheticBackground />
      <div className="max-w-[1200px] mx-auto relative z-10 pt-2">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100">
            <ShieldCheck size={10} strokeWidth={3} /> Network Discovery
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">
                Find <span className="text-gradient">Peers.</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Discover students in {collegeName}
              </p>
            </div>
            {!isLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm"
              >
                <Users size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{peers.length} peers online</span>
              </motion.div>
            )}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT SIDEBAR */}
          <motion.div 
            variants={sidebarVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-3 space-y-5 order-2 lg:order-1"
          >
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-shadow duration-500">
              <div className="h-24 bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 relative overflow-hidden">
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-xl"
                />
                <motion.div 
                  animate={{ scale: [1.2, 1, 1.2], rotate: [0, -3, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl"
                />
              </div>
              <div className="px-6 pb-6 -mt-10 flex flex-col items-center">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-[2px]" />
                    <div className="relative w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white mb-3 shadow-xl">
                        <img src={getMediaUrl(user.avatar, "avatar", user.username)} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white text-center leading-tight">{user.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 text-center">{collegeName}</p>
              </div>
              <div className="px-6 pb-6">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connections</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-indigo-600 font-black text-sm">{user.followingCount || 0}</span>
                      </div>
                  </div>
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-shadow duration-500">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-indigo-50 rounded-xl">
                   <Sparkles size={14} className="text-indigo-500" />
                 </div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Tips</h4>
               </div>
               <ul className="space-y-3">
                 {[
                   "Connect with classmates to unlock encrypted chat",
                   "Follow peers to see their posts in your feed",
                   "Build your network to discover opportunities"
                 ].map((tip, i) => (
                   <li key={i} className="flex items-start gap-2.5">
                     <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{tip}</p>
                   </li>
                 ))}
               </ul>
            </div>
          </motion.div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            {/* Search */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all shadow-sm dark:shadow-slate-900 placeholder:text-slate-300 dark:placeholder:text-slate-500"
              />
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1"
                >
                  ✕
                </motion.button>
              )}
            </motion.div>

            {/* Result count */}
            {!isLoading && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1"
              >
                {searchTerm 
                  ? `${resultCount} result${resultCount !== 1 ? 's' : ''} for "${searchTerm}"`
                  : `Showing ${resultCount} peer${resultCount !== 1 ? 's' : ''}`
                }
              </motion.p>
            )}

            {/* Peer Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 animate-pulse shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-100" />
                      <div className="space-y-2 w-full flex flex-col items-center">
                        <div className="w-24 h-3 bg-slate-100 rounded-full" />
                        <div className="w-16 h-2 bg-slate-50 rounded-full" />
                      </div>
                      <div className="w-full h-10 bg-slate-50 rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayFriends.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {displayFriends.map(friend => (
                  <motion.div key={friend._id} variants={cardVariants} layout>
                    <FriendCard 
                      friend={friend}
                      isSent={sentRequests.includes(friend._id)}
                      onConnect={handleConnect}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-white dark:border-slate-700 shadow-xl dark:shadow-slate-900 flex flex-col items-center justify-center gap-5"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-lg border border-slate-100">
                  <Users size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">
                    {searchTerm ? "No matches found" : "Zero Nodes Detected"}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    {searchTerm ? "Try a different search term" : "No other peers found in this sector"}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <motion.div 
            variants={rightSidebarVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-3 space-y-5 order-3"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-shadow duration-500">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Network Stats</h3>
              
              <div className="space-y-3">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Following</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{user.followingCount || 0}</p>
                  </div>
                  <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <ArrowUpRight size={16} className="text-indigo-500" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Followers</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{user.followersCount || 0}</p>
                  </div>
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users size={16} className="text-blue-500" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Available</p>
                    <p className="text-xl font-black text-emerald-600 tracking-tight">{peers.length}</p>
                  </div>
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sparkles size={16} className="text-emerald-500" />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Network Activity Indicator */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-6 shadow-sm dark:shadow-slate-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Network</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Your campus network is active. Connect with peers to start encrypted conversations.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// 👤 Friend Card Component
function FriendCard({ friend, isSent, onConnect }) {
  const followed = friend.isFollowing || isSent;
  
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-5 flex flex-col items-center text-center hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 shadow-sm dark:shadow-slate-900 group h-full"
    >
      <Link to={`/user/${friend._id}`} className="relative mb-4">
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-[2px]" />
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-[3px] border-white shadow-lg bg-slate-50">
          <img src={getMediaUrl(friend.avatar, "avatar", friend.username)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        </div>
      </Link>
      
      <Link to={`/user/${friend._id}`} className="text-sm font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-0.5 leading-tight">{friend.name}</Link>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">@{friend.username}</p>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => onConnect(friend._id)}
        disabled={followed}
        className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
          followed 
          ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-default" 
          : "bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200 hover:shadow-indigo-100"
        }`}
      >
        {followed ? <Check size={14} strokeWidth={3} /> : <UserPlus size={14} strokeWidth={3} />}
        {followed ? "Connected" : "Connect"}
      </motion.button>
    </motion.div>
  );
}
