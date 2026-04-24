import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Bell, User, Check, Trash2, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { motion as Motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import axios from "axios";
import { io } from "socket.io-client";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";

export default function UniConnectTopBar() {
  const navigate = useNavigate();
  const _location = useLocation();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();

    const API = API_BASE_URL.replace("/api", "");
    const socket = io(API, { auth: { token } });
    
    socket.on("notification", (notif) => {
      // Ensure structure matches
      const formattedNotif = {
          ...notif,
          _id: notif._id || notif.id,
          created_at: notif.createdAt || notif.created_at || new Date().toISOString()
      };
      setNotifications(prev => [formattedNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, [token, user]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* --- PREMIUM LIGHT GLASS TRAY --- */}
      <Motion.div 
        layout
        className="flex items-center gap-1 p-1 bg-white border border-slate-100 rounded-xl shadow-sm"
      >
        <div className="relative">
          <UtilityButton 
            icon={<Bell size={18} strokeWidth={2.5} />} 
            notification={unreadCount > 0} 
            label="Alerts" 
            onClick={() => setShowNotifications(!showNotifications)}
            isActive={showNotifications}
          />
          
          <AnimatePresence>
            {showNotifications && (
              <Motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-12 right-0 w-80 md:w-96 bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden z-[110]"
              >
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Center</h3>
                  {unreadCount > 0 && <span className="px-2.5 py-1 bg-indigo-600 text-[9px] font-black rounded-full text-white shadow-lg shadow-indigo-100">{unreadCount} New</span>}
                </div>
                
                <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-slate-200" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No alerts yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n._id} 
                        onClick={() => markAsRead(n._id)}
                        className={`p-4 border-b border-slate-50 flex gap-4 hover:bg-slate-50 transition-all cursor-pointer ${!n.is_read ? "bg-indigo-500/[0.02]" : ""}`}
                      >
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-slate-100 border border-white shadow-sm overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender?.username || 'user'}`} className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800 font-bold leading-snug mb-1">{n.text}</p>
                          <div className="flex items-center gap-2">
                             <Clock size={10} className="text-slate-400" />
                             <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                               {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 rounded-full mt-1.5 bg-indigo-600 shadow-sm" />}
                      </div>
                    ))
                  )}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-4 mx-0.5 bg-slate-100" />
        
        <UtilityButton 
          icon={<MessageCircle size={18} strokeWidth={2.5} />} 
          onClick={() => navigate("/chat")} 
          label="Inbox" 
        />
      </Motion.div>
    </div>
  );
}

function UtilityButton({ icon, notification, onClick, label, isActive }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative flex items-center gap-2 p-3.5 rounded-2xl transition-all group ${
        isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50"
      }`}
    >
      <div className="relative z-10">
        {icon}
        {notification && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 border-2 border-white"></span>
          </span>
        )}
      </div>

      <AnimatePresence>
        {(isHovered || isActive) && (
          <Motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden pr-1"
          >
            {label}
          </Motion.span>
        )}
      </AnimatePresence>
    </Motion.button>
  );
}
