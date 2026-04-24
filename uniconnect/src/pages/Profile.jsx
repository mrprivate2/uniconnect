import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid, Film, UserSquare2, PlusSquare, Menu, ChevronDown, 
  Link as LinkIcon, Camera, Heart, User as UserIcon, Lock, Share, Settings, X, Briefcase
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";
import ContentModal from "../components/ContentModal";
import toast from "react-hot-toast";

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
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans selection:bg-indigo-100">
      
      {/* 📱 TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-14 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight lowercase">{profileData?.username}</h1>
          <ChevronDown size={16} strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-5">
          <PlusSquare size={24} strokeWidth={2} className="cursor-pointer" onClick={() => navigate("/create")} />
          <Settings size={24} strokeWidth={2} className="cursor-pointer" onClick={() => navigate("/settings")} />
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">
        
        {/* 👤 PROFILE HEADER */}
        <div className="flex items-center gap-8 mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] bg-gradient-to-tr from-indigo-100 to-indigo-500 group-hover:from-indigo-400 group-hover:to-indigo-600 transition-all duration-500">
              <div className="w-full h-full rounded-full bg-white p-[2px] relative overflow-hidden">
                <img 
                  src={avatarUrl} 
                  alt={profileData?.username}
                  className="w-full h-full rounded-full object-cover bg-slate-50 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={20} className="text-white" />
                </div>
              </div>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
          </div>

          <div className="flex-1 flex justify-between px-2">
            {[
              { label: "Posts", value: posts.length, onClick: null },
              { label: "Followers", value: profileData?.followersCount || 0, onClick: () => setShowModal('followers') },
              { label: "Following", value: profileData?.followingCount || 0, onClick: () => setShowModal('following') }
            ].map(stat => (
              <div key={stat.label} className={`flex flex-col items-center ${stat.onClick ? 'cursor-pointer' : ''}`} onClick={stat.onClick}>
                <span className="text-base font-bold text-slate-900">{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📝 BIO SECTION */}
        <div className="mb-6 px-1">
          <h2 className="text-sm font-black text-slate-900 mb-0.5">{profileData?.name}</h2>
          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-tight mb-2">
            {profileData?.bio || "No bio signals detected."}
          </p>
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
            <LinkIcon size={12} className="rotate-45" />
            <span className="hover:underline cursor-pointer">{profileData?.college?.name || "Independent Node"}</span>
          </div>
        </div>

        {/* ⚙️ ACTION BUTTONS */}
        <div className="flex gap-2 mb-10">
          <button 
            onClick={() => navigate("/settings")}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 border border-slate-200"
          >
            Edit Settings
          </button>
          <button 
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
          >
            Share Node
          </button>
        </div>

        {/* 📑 TABS SECTION */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "grid", icon: Grid },
            { id: "reels", icon: Film },
            { id: "management", icon: Briefcase },
            { id: "tagged", icon: UserSquare2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex justify-center py-3 relative ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-300'}`}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-900" />
              )}
            </button>
          ))}
        </div>

        {/* 🖼 CONTENT AREA */}
        <div className="mt-0.5 min-h-[40vh]">
          {activeTab === "management" ? (
            <div className="space-y-6 pt-6">
                {managementData.length > 0 ? (
                    managementData.map(event => (
                        <div key={event._id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.title}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(event.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-100">{event.type}</span>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Applicant Nodes ({event.applicants?.length || 0})</h4>
                                {event.applicants?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {event.applicants.map(app => (
                                            <Link 
                                                key={app._id} 
                                                to={`/user/${app.user?._id}`}
                                                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 group"
                                            >
                                                <img src={getMediaUrl(app.user?.avatar, "avatar", app.user?.username)} className="w-6 h-6 rounded-lg object-cover" />
                                                <div className="pr-1">
                                                    <p className="text-[10px] font-black text-slate-800 leading-none mb-0.5">{app.user?.username}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 leading-none">{app.user?.name}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-slate-300 text-[8px] font-black uppercase tracking-widest italic border border-dashed border-slate-100 rounded-xl">Zero signals detected</div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 text-center text-slate-300 uppercase text-[10px] font-black tracking-[0.4em] italic">No active management sectors</div>
                )}
            </div>
          ) : (
            /* POSTS GRID */
            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {profileLoading ? (
                    [...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-100 animate-pulse border border-white" />
                    ))
                ) : (
                    (activeTab === "grid" ? posts : savedPosts).length > 0 ? (
                    (activeTab === "grid" ? posts : savedPosts).map(post => (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={post._id} 
                            className="aspect-square bg-slate-50 relative group cursor-pointer overflow-hidden" 
                            onClick={() => setSelectedContent(post)}
                        >
                        {post.image ? (
                            <img src={getMediaUrl(post.image)} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-2 text-center text-[8px] text-slate-300 font-black uppercase bg-slate-50">
                            {post.content?.substring(0, 30)}...
                            </div>
                        )}
                        </motion.div>
                    ))
                    ) : (
                    <div className="col-span-3 py-32 text-center text-slate-300 uppercase text-[10px] font-black tracking-[0.4em] italic">
                        Zero data detected
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
