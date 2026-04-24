import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Heart, UserPlus, MessageCircle, Megaphone, 
  Trash2, CheckCircle2, Clock, ShieldCheck, ChevronRight
} from "lucide-react";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";
import toast from "react-hot-toast";

// 📡 RADAR SCAN ANIMATION
const RadarScan = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10"
        >
            <div className="w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-tl-full origin-bottom-right" />
        </motion.div>
        {[...Array(3)].map((_, i) => (
            <div 
                key={i} 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10"
                style={{ width: (i + 1) * 300, height: (i + 1) * 300 }}
            />
        ))}
    </div>
);

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
      // Backend might need a delete route, if not I'll just filter locally for now 
      // or implement the backend route later. Assuming standard CRUD.
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Notification cleared from local grid.");
  };

  const getIcon = (type) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-rose-500 fill-rose-500" />;
      case "follow": return <UserPlus size={16} className="text-blue-500" />;
      case "comment": return <MessageCircle size={16} className="text-emerald-500" />;
      case "announcement": return <Megaphone size={16} className="text-amber-500" />;
      default: return <Bell size={16} className="text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen pb-40 font-sans bg-mesh text-slate-900 relative overflow-hidden selection:bg-blue-100">
      <RadarScan />
      <div className="max-w-2xl mx-auto p-6 pt-16 md:pt-24 relative z-10">
        
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100">
                <ShieldCheck size={12} strokeWidth={3} /> Signal Processor
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
              Neural<span className="text-indigo-600">.</span>Inbox
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2">Monitoring {notifications.length} active transmission nodes</p>
          </div>
          
          {notifications.some(n => !n.is_read) && (
              <button 
                onClick={() => notifications.filter(n => !n.is_read).forEach(n => markAsRead(n._id))}
                className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Sync All Nodes
              </button>
          )}
        </header>

        {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-6">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Decoding incoming signals...</p>
            </div>
        ) : notifications.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                    <Bell size={40} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Zero Network Noise</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Environment is currently silent.</p>
            </div>
        ) : (
            <div className="space-y-3">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => !n.is_read && markAsRead(n._id)}
                            className={`group relative p-5 rounded-[1.8rem] border transition-all cursor-pointer flex items-start gap-4 ${
                                n.is_read 
                                ? "bg-white/40 border-slate-50 opacity-60" 
                                : "bg-white border-white shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10"
                            }`}
                        >
                            {!n.is_read && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
                            )}
                            
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
                                    <img src={getMediaUrl(n.sender?.avatar, "avatar", n.sender?.username)} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md border border-slate-50 flex items-center justify-center">
                                    {getIcon(n.type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-medium text-slate-700 leading-snug">
                                        <span className="font-black text-slate-900">{n.sender?.name || "System"}</span> 
                                        {" "}{n.text}
                                    </p>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter shrink-0 ml-4 flex items-center gap-1">
                                        <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                
                                {n.post && (
                                    <div className="mt-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                                        {n.post.image && (
                                            <img src={getMediaUrl(n.post.image)} className="w-8 h-8 rounded-lg object-cover" />
                                        )}
                                        <p className="text-[10px] font-bold text-slate-400 line-clamp-1 italic">"{n.post.content || n.post.title}"</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}

      </div>
    </div>
  );
}
