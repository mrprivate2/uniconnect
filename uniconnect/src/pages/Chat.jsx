import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MessageSquare, Send, ArrowLeft, 
  MoreVertical, Image as ImageIcon, Smile,
  ShieldCheck, Lock, Zap, Clock, Info, Globe, ChevronRight, CheckCheck, Plus, X, Camera, Paperclip
} from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";

// Lightweight Technical Emoji Hub
const EMOJI_SET = ["⚡", "🔒", "🔐", "🛡️", "🛰️", "💻", "🔥", "🚀", "🎯", "✨", "📡", "✅", "⚠️", "🚫", "🧠", "👋", "😊", "😂", "👍", "🙌", "❤️", "💎"];

// 🔒 ENCRYPTED PULSE ANIMATION
const EncryptedPulse = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2, opacity: [0, 0.1, 0] }}
                transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    delay: i * 1.5,
                    ease: "easeOut"
                }}
                className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] border-2 border-blue-400/20 rounded-full"
            />
        ))}
        <div className="absolute bottom-10 left-10 w-4 h-4 bg-blue-500 rounded-full blur-md animate-pulse" />
    </div>
);

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const API = API_BASE_URL.replace("/api", "");

  const selectedUserRef = useRef(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    const s = io(API, { auth: { token } });
    setSocket(s);

    s.on("online_users", (users) => setOnlineUsers(users));
    
    s.on("receive_message", (msg) => {
        if (msg.senderId === selectedUserRef.current?._id || msg.receiverId === selectedUserRef.current?._id) {
            setMessages(prev => {
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        }
    });

    s.on("user_typing", ({ senderId, isTyping, senderName }) => {
        if (senderId === selectedUserRef.current?._id) {
            setOtherUserTyping(isTyping ? { senderName } : null);
        }
    });

    return () => s.disconnect();
  }, [API, token, user?._id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filtered = data.filter(u => u._id !== user?._id);
        setConversations(filtered);

        if (targetUserId) {
            const target = filtered.find(u => u._id === targetUserId);
            if (target) {
                setSelectedUser(target);
            } else {
                const userRes = await axios.get(`${API_BASE_URL}/users/${targetUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (userRes.data) {
                    const foundUser = { ...userRes.data, _id: userRes.data._id || userRes.data.id };
                    setConversations(prev => [foundUser, ...prev]);
                    setSelectedUser(foundUser);
                }
            }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchUsers();
  }, [token, user?._id, targetUserId]);

  useEffect(() => {
    if (selectedUser) {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/chat/${selectedUser._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const formatted = data.map(m => ({
                    ...m,
                    senderId: m.sender_id,
                    receiverId: m.receiver_id,
                    time: m.created_at
                }));
                setMessages(formatted);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    } else {
        setMessages([]);
    }
  }, [selectedUser, token]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, otherUserTyping]);

  const handleTyping = (val) => {
    setNewMessage(val);
    if (!socket || !selectedUser) return;
    
    if (!isTyping && val.length > 0) {
        setIsTyping(true);
        socket.emit("typing", { receiverId: selectedUser._id, isTyping: true, senderName: user.name });
    } else if (isTyping && val.length === 0) {
        setIsTyping(false);
        socket.emit("typing", { receiverId: selectedUser._id, isTyping: false, senderName: user.name });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedUser) return;
    socket.emit("send_message", {
        receiverId: selectedUser._id,
        text: newMessage
    });
    setNewMessage("");
    setIsTyping(false);
    socket.emit("typing", { receiverId: selectedUser._id, isTyping: false, senderName: user.name });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("media", file);
    formData.append("receiverId", selectedUser._id);

    try {
      const res = await axios.post(`${API_BASE_URL}/chat/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      setMessages(prev => [...prev, {
          ...res.data,
          senderId: user._id,
          receiverId: selectedUser._id,
          time: new Date()
      }]);
    } catch (err) {
      console.error(err);
      alert("Transmission Failure.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-45px)] w-full flex font-sans bg-mesh text-slate-900 overflow-hidden relative selection:bg-blue-100">
        <EncryptedPulse />
        <div className={`w-full lg:w-[380px] border-r border-blue-50 bg-white/80 backdrop-blur-xl flex flex-col shrink-0 relative z-20 ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-8 pb-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Grid Nodes</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Authorized Comms</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <MessageSquare size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div className="relative group mb-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Filter nodes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-32">
                <div className="space-y-1">
                    {filteredConversations.map(conv => {
                        const isOnline = onlineUsers.includes(conv._id);
                        return (
                            <motion.div 
                                key={conv._id}
                                whileHover={{ x: 4 }}
                                onClick={() => setSelectedUser(conv)}
                                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${selectedUser?._id === conv._id ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-[1.2rem] overflow-hidden border-2 ${selectedUser?._id === conv._id ? 'border-indigo-400/30' : 'border-slate-100'}`}>
                                        <img src={getMediaUrl(conv.avatar, "avatar", conv.username)} className="w-full h-full object-cover" />
                                    </div>
                                    {isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className={`text-sm font-black tracking-tight truncate ${selectedUser?._id === conv._id ? 'text-white' : 'text-slate-900'}`}>{conv.name}</h4>
                                        <span className={`text-[8px] font-bold uppercase ${selectedUser?._id === conv._id ? 'text-indigo-300' : 'text-slate-400'}`}>{isOnline ? 'Live' : 'Last 10m'}</span>
                                    </div>
                                    <p className={`text-[10px] font-medium truncate opacity-70 ${selectedUser?._id === conv._id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        {isOnline ? "Active Synchronization" : "Environment Offline"}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 pb-28">
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <ShieldCheck size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Protocol Link</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">E2EE Tunnel Active</p>
                    </div>
                </div>
            </div>
        </div>
        <div className={`flex-1 flex flex-col bg-mesh relative ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
            {selectedUser ? (
                <>
                    <div className="px-8 py-5 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedUser(null)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                    <img src={getMediaUrl(selectedUser.avatar, "avatar", selectedUser.username)} className="w-full h-full object-cover" />
                                </div>
                                {onlineUsers.includes(selectedUser._id) && (
                                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">{selectedUser.name}</h3>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${onlineUsers.includes(selectedUser._id) ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {onlineUsers.includes(selectedUser._id) ? "Session Active" : "Disconnected Node"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200">
                                <Lock size={12} strokeWidth={3} /> Clear Node
                             </button>
                             <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                <MoreVertical size={20} />
                             </button>
                        </div>
                    </div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-40">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?._id;
                            return (
                                <motion.div 
                                    key={msg._id || idx}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                        <div className={`px-5 py-3.5 rounded-[1.8rem] text-sm font-medium leading-relaxed shadow-sm ${
                                            isMe 
                                            ? 'bg-slate-900 text-white rounded-br-none shadow-xl shadow-slate-200' 
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                                        }`}>
                                            {msg.image ? (
                                                <div className="space-y-3">
                                                    <img src={getMediaUrl(msg.image)} className="max-w-full rounded-2xl border border-white/10" />
                                                    <p className="text-xs opacity-80">{msg.text}</p>
                                                </div>
                                            ) : msg.text}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 px-2">
                                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">
                                                {new Date(msg.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && <CheckCheck size={10} className="text-indigo-400" />}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <AnimatePresence>
                            {otherUserTyping && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-3 ml-2"
                                >
                                    <div className="flex gap-1.5 p-3.5 bg-white border border-slate-100 rounded-full rounded-bl-none shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{otherUserTyping.senderName} is encoding...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="p-8 pb-28 bg-white/80 backdrop-blur-xl border-t border-slate-100 relative">
                        <AnimatePresence>
                            {showEmojis && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full left-8 mb-4 p-4 bg-white border border-slate-100 rounded-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.05)] grid grid-cols-6 gap-2 z-50"
                                >
                                    {EMOJI_SET.map(e => (
                                        <button 
                                            key={e} 
                                            onClick={() => {
                                                handleTyping(newMessage + e);
                                                setShowEmojis(false);
                                            }}
                                            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-3 max-w-5xl mx-auto">
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                            <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm shrink-0">
                                {isUploading ? <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> : <Paperclip size={20} strokeWidth={2.5} />}
                            </button>
                            <div className="flex-1 flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-[2.2rem] px-7 py-4 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5 shadow-inner relative">
                                <input 
                                    type="text" 
                                    placeholder="Enter encrypted transmission payload..."
                                    value={newMessage}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 font-medium"
                                />
                                <button onClick={() => setShowEmojis(!showEmojis)} className={`transition-colors ${showEmojis ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-600'}`}>
                                    <Smile size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <button onClick={sendMessage} disabled={!newMessage.trim()} className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shrink-0">
                                <Send size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center pb-32">
                    <div className="w-32 h-32 rounded-[3.5rem] bg-white border border-slate-100 flex items-center justify-center mb-10 shadow-[0_30px_80px_rgba(0,0,0,0.03)] group hover:scale-110 transition-transform duration-700">
                        <MessageSquare size={48} strokeWidth={1} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Transmission Hub</h2>
                    <p className="text-slate-400 font-medium max-w-xs mb-10 leading-relaxed text-sm">Select an authorized node from the grid to initialize a secure peer-to-peer transmission protocol.</p>
                </div>
            )}
        </div>
    </div>
  );
}
