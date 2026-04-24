// 🚀 UniConnect Profile Logic - Updated 2026-04-24
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid, Film, UserSquare2, PlusSquare, Menu, ChevronDown, 
  Link as LinkIcon, Camera, Heart, User as UserIcon, Lock, Share, Settings, X, Briefcase,
  LayoutGrid, Bookmark, Plus, MessageSquare
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";
import ContentModal from "../components/ContentModal";
import toast from "react-hot-toast";

// 🌌 AESTHETIC BACKGROUND (Floating Orbs & Aurora)
const AestheticBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Shifting Aurora Spotlights */}
        <motion.div 
            animate={{ 
                x: [-100, 100, -100],
                y: [-50, 50, -50],
                scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]"
        />
        <motion.div 
            animate={{ 
                x: [100, -100, 100],
                y: [50, -50, 50],
                scale: [1.2, 1, 1.2]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/10 rounded-full blur-[120px]"
        />

        {/* Floating Glass Orbs */}
        {[...Array(6)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ 
                    x: `${Math.random() * 100}vw`, 
                    y: `${Math.random() * 100}vh`,
                    opacity: 0
                }}
                animate={{ 
                    y: ["110vh", "-10vh"],
                    x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
                    opacity: [0, 0.15, 0.15, 0]
                }}
                transition={{ 
                    duration: Math.random() * 20 + 30, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: -Math.random() * 30
                }}
                className="absolute rounded-full bg-white/5 border border-white/10 backdrop-blur-[4px] shadow-2xl"
                style={{ 
                    width: `${Math.random() * 200 + 100}px`,
                    height: `${Math.random() * 200 + 100}px`
                }}
            />
        ))}
    </div>
);

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(authUser);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("grid");
  
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [managementData, setManagementData] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); 
  const [uploading, setUploading] = useState(false);
  
  const token = localStorage.getItem("token");
  const API = API_BASE_URL.replace("/api", "");

  useEffect(() => {
    if (!token) {
        navigate("/");
        return;
    }

    const fetchProfileData = async () => {
      try {
        const [profileRes, postsRes, managementRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/users/${authUser._id || authUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/posts/user/${authUser._id || authUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/posts/my-management`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] }))
        ]);

        setProfileData(profileRes.data);
        setPosts(postsRes.data);
        setSavedPosts(profileRes.data.savedPosts || []);
        setManagementData(managementRes.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setProfileLoading(false);
      }
    };

    if (authUser?._id || authUser?.id) {
      fetchProfileData();
    }
  }, [navigate, authUser?._id, authUser?.id, token]);

  // Real-time updates
  useEffect(() => {
    if (!token) return;
    const socket = io(API, { auth: { token } });
    
    socket.on("relationship_updated", (data) => {
        if (data.followersCount !== undefined) {
            setProfileData(prev => ({ ...prev, followersCount: data.followersCount }));
        }
        if (data.followingCount !== undefined) {
            setProfileData(prev => ({ ...prev, followingCount: data.followingCount }));
        }
    });

    return () => socket.disconnect();
  }, [API, token]);

  const handleUpdateContent = (updated) => {
    const update = (list) => list.map(p => p._id === updated._id ? updated : p);
    setPosts(update);
    setSavedPosts(update);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/users/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      const newAvatarUrl = res.data.avatar;
      setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
      updateUser({ avatar: newAvatarUrl });
      toast.success("Identity visual updated.");
    } catch (err) {
      console.error(err);
      toast.error("Visual synchronization failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("IRREVERSIBLE: Purge node?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.filter(p => p._id !== postId));
      setSavedPosts(prev => prev.filter(p => p._id !== postId));
      setSelectedContent(null);
      toast.success("Node purged.");
    } catch (err) {
      toast.error("Termination failed.");
    }
  };

  const avatarUrl = getMediaUrl(profileData?.avatar, "avatar", profileData?.username);

  return (
    <div className="min-h-screen bg-mesh text-slate-900 pb-40 font-sans selection:bg-blue-100 relative overflow-x-hidden">
      <AestheticBackground />

      {/* 📱 TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-blue-50 h-14 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black tracking-tighter text-slate-900 lowercase italic">
            Uni<span className="text-blue-600">Connect</span>
          </h1>
          <div className="w-px h-4 bg-slate-200 mx-2" />
          <span className="text-xs font-bold text-slate-500">{profileData?.username}</span>
        </div>
        <div className="flex items-center gap-4">
          <Settings size={22} strokeWidth={2.5} className="cursor-pointer text-slate-600 hover:text-blue-600 transition-colors" onClick={() => navigate("/settings")} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-24 px-6 relative z-10">
        
        {/* --- PROFILE HEADER CARD (INSTA-TECH BLEND) --- */}
        <div className="bg-white rounded-[3rem] p-10 border border-blue-50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] mb-12 relative overflow-hidden">
            {/* Decorative inner glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                {/* Avatar with Tech Border */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full animate-spin-slow opacity-20 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-2xl bg-slate-50">
                        <img 
                            src={avatarUrl} 
                            alt={profileData?.username} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl hover:scale-110 transition-transform"
                    >
                        <Camera size={18} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>

                {/* Profile Identity & Stats */}
                <div className="flex-1 flex flex-col gap-8 text-center md:text-left">
                    <div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{profileData?.name}</h2>
                            <button 
                                onClick={() => navigate("/settings")}
                                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                Edit System Node
                            </button>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                            {profileData?.bio || "No mission statement defined for this node identity."}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-4">
                            <LinkIcon size={12} className="rotate-45" />
                            <span className="hover:underline cursor-pointer">{profileData?.college?.name || "Independent Node"}</span>
                        </div>
                    </div>

                    {/* Stats Dashboard Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl text-center hover:bg-blue-50 transition-colors cursor-default">
                            <p className="text-xl font-black text-blue-600">{posts.length}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logs</p>
                        </div>
                        <div 
                            onClick={() => setShowModal("followers")}
                            className="bg-white border border-slate-100 p-4 rounded-2xl text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                        >
                            <p className="text-xl font-black text-slate-900">{profileData?.followersCount || 0}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peers</p>
                        </div>
                        <div 
                            onClick={() => setShowModal("following")}
                            className="bg-white border border-slate-100 p-4 rounded-2xl text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                        >
                            <p className="text-xl font-black text-slate-900">{profileData?.followingCount || 0}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signals</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CONTENT NAVIGATION (TAB SWITCHER) --- */}
        <div className="flex justify-center border-t border-blue-50 relative mb-12">
            <div className="flex gap-12">
                {[
                    { id: "grid", label: "DATA LOGS", icon: LayoutGrid },
                    { id: "management", label: "ADMIN SECTOR", icon: Briefcase },
                    { id: "tagged", label: "SAVED NODES", icon: Bookmark }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 border-t-2 transition-all duration-500 ${
                            activeTab === tab.id 
                            ? "border-blue-600 text-blue-600" 
                            : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <tab.icon size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[40vh]">
          {activeTab === "management" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {managementData.length > 0 ? (
                    managementData.map(event => (
                        <div key={event._id} className="bg-white rounded-[2.5rem] border border-blue-50 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{event.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(event.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100">{event.type}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Applicant Nodes ({event.applicants?.length || 0})</h4>
                                {event.applicants?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {event.applicants.map(app => (
                                            <Link 
                                                key={app._id} 
                                                to={`/user/${app.user?._id}`}
                                                className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 rounded-2xl transition-all border border-slate-100"
                                            >
                                                <img src={getMediaUrl(app.user?.avatar, "avatar", app.user?.username)} className="w-8 h-8 rounded-xl object-cover" />
                                                <div className="pr-2">
                                                    <p className="text-[10px] font-black text-slate-800 leading-none mb-1">{app.user?.username}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 leading-none uppercase">{app.user?.name}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest italic border border-dashed border-slate-100 rounded-[2rem]">Zero signals detected</div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center text-slate-300 uppercase text-[10px] font-black tracking-[0.4em] italic">No active management sectors</div>
                )}
            </div>
          ) : (
            /* POSTS GRID (UNIFIED LOGS/SAVED) */
            <div className="grid grid-cols-3 gap-2 md:gap-8">
                {profileLoading ? (
                    [...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white rounded-[2rem] animate-pulse border border-slate-50 shadow-sm" />
                    ))
                ) : (
                    (activeTab === "grid" || activeTab === "tagged" ? (activeTab === "grid" ? posts : savedPosts) : []).length > 0 ? (
                    (activeTab === "grid" ? posts : savedPosts).map(post => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -8 }}
                            key={post._id} 
                            className="aspect-square bg-white rounded-[1.5rem] md:rounded-[3rem] relative group cursor-pointer overflow-hidden border border-blue-50 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500" 
                            onClick={() => setSelectedContent(post)}
                        >
                        {post.image ? (
                            <img src={getMediaUrl(post.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-6 text-center text-[10px] text-slate-400 font-bold leading-relaxed bg-slate-50 italic">
                                {post.content?.substring(0, 80)}...
                            </div>
                        )}
                        {/* Insta-style Stats Overlay */}
                        <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white backdrop-blur-[2px]">
                            <div className="flex items-center gap-2">
                                <Heart size={20} fill="currentColor" />
                                <span className="font-black text-sm">{post.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20} fill="currentColor" />
                                <span className="font-black text-sm">{post.comments?.length || 0}</span>
                            </div>
                        </div>
                        </motion.div>
                    ))
                    ) : (
                    <div className="col-span-full py-32 text-center bg-white/50 rounded-[4rem] border border-dashed border-blue-100 shadow-sm">
                        <Plus size={40} className="mx-auto text-blue-200 mb-4" />
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Zero data detected</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Node history is currently empty</p>
                    </div>
                    )
                )}
            </div>
          )}
        </div>

      </main>

      <AnimatePresence>
        {selectedContent && (
            <ContentModal 
                content={selectedContent} 
                onClose={() => setSelectedContent(null)} 
                onUpdate={handleUpdateContent}
                onDelete={handleDeletePost}
            />
        )}
        {showModal && (
          <FollowModal 
            type={showModal} 
            userId={authUser?._id || authUser?.id} 
            onClose={() => setShowModal(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function FollowModal({ type, userId, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/friends/${userId}/${type}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(res.data);
            } catch (err) {
                console.error(`Failed to fetch ${type}:`, err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [type, userId, token]);

    const handleRemove = async (targetId) => {
        try {
            await axios.delete(`${API_BASE_URL}/friends/remove-follower/${targetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(prev => prev.filter(u => u._id !== targetId));
            toast.success("Follower removed.");
        } catch (err) {
            toast.error("Failed to remove follower.");
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[60vh] bg-mesh"
            >
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{type} Nodes</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-10 flex flex-col items-center gap-4 text-slate-300">
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] italic">
                            Zero {type} found
                        </div>
                    ) : (
                        users.map(u => (
                            <div key={u._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-slate-100">
                                <Link 
                                    to={`/user/${u._id}`} 
                                    onClick={onClose}
                                    className="flex items-center gap-4 flex-1"
                                >
                                    <img src={getMediaUrl(u.avatar, "avatar", u.username)} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{u.username}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{u.name}</p>
                                    </div>
                                    {u.isFollowing && (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-slate-200">Following</span>
                                    )}
                                </Link>
                                {type === 'followers' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemove(u._id); }}
                                        className="px-4 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
