import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Heart, UserPlus, MessageCircle, Megaphone, 
  Trash2, Clock, ShieldCheck
} from "lucide-react";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";
import toast from "react-hot-toast";

// 📡 RADAR SCAN ANIMATION
const RadarScan = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
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

// 🎯 Stagger Variants
const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -16, scale: 0.98 },
    show: {
        opacity: 1, x: 0, scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 22, mass: 0.8 },
    },
};

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

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => markAsRead(n._id)));
  };

  const deleteNotification = async (id) => {
      try {
        await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success("Notification purged from network.");
      } catch (err) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success("Notification cleared from local grid.");
      }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like": return <Heart size={14} className="text-rose-500 fill-rose-500" />;
      case "follow": return <UserPlus size={14} className="text-blue-500" />;
      case "comment": return <MessageCircle size={14} className="text-emerald-500" />;
      case "announcement": return <Megaphone size={14} className="text-amber-500" />;
      default: return <Bell size={14} className="text-indigo-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen pb-40 font-sans bg-mesh text-slate-900 dark:text-slate-100 relative overflow-hidden selection:bg-blue-100 dark:selection:bg-blue-900/50">
      <RadarScan />
      <div className="max-w-2xl mx-auto p-3 sm:p-6 pt-3 sm:pt-4 relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex justify-between items-end"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100">
                <ShieldCheck size={10} strokeWidth={3} /> Signal Processor
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
              Neural<span className="text-indigo-600">.</span>Inbox
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
              Monitoring {notifications.length} active transmission nodes
            </p>
          </div>
          
          {unreadCount > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={markAllAsRead}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors px-4 py-2 hover:bg-indigo-50 rounded-xl"
              >
                Mark all read
              </motion.button>
          )}
        </motion.header>

        {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-5">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Decoding incoming signals...</p>
            </div>
        ) : notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-28 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-white dark:border-slate-700 shadow-xl dark:shadow-slate-900"
            >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-5 border border-slate-100">
                    <Bell size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">Zero Network Noise</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Environment is currently silent.</p>
            </motion.div>
        ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-2.5"
            >
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n._id}
                            variants={itemVariants}
                            exit={{ opacity: 0, x: 50, scale: 0.95 }}
                            layout
                            onClick={() => !n.is_read && markAsRead(n._id)}
                            className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-3.5 ${
                                n.is_read 
                                ? "bg-white/40 dark:bg-slate-900/40 border-slate-50 dark:border-slate-700 opacity-60 hover:opacity-80" 
                                : "bg-white dark:bg-slate-900 border-white dark:border-slate-700 shadow-lg shadow-indigo-500/5 dark:shadow-slate-900 hover:shadow-indigo-500/10"
                            }`}
                        >
                            {!n.is_read && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                            )}
                            
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
                                    <img src={getMediaUrl(n.sender?.avatar, "avatar", n.sender?.username)} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md border border-slate-50 flex items-center justify-center">
                                    {getIcon(n.type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-3">
                                    <p className="text-[13px] font-medium text-slate-700 leading-snug">
                                        <span className="font-black text-slate-900">{n.sender?.name || "System"}</span> 
                                        {" "}{n.text}
                                    </p>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter shrink-0 flex items-center gap-1 mt-0.5">
                                        <Clock size={9} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                
                                {n.post && (
                                    <div className="mt-2.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-2.5">
                                        {n.post.image && (
                                            <img src={getMediaUrl(n.post.image)} className="w-7 h-7 rounded-lg object-cover shrink-0" alt="" />
                                        )}
                                        <p className="text-[10px] font-bold text-slate-400 line-clamp-1 italic">"{n.post.content || n.post.title}"</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all shrink-0"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        )}

      </div>
    </div>
  );
}
