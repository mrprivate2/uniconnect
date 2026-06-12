import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid, Film, UserSquare2, Menu,
  Link as LinkIcon, MessageSquare,
  UserPlus, UserMinus, ArrowLeft, X, Heart, MessageCircle, Sparkles, ShieldCheck
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
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

export default function UserProfile() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followedBy, setFollowedBy] = useState(false);
  const [showModal, setShowModal] = useState(null);
  
  const token = localStorage.getItem("token");
  const API = API_BASE_URL.replace("/api", "");

  useEffect(() => {
    if (id === currentUser?._id) {
        navigate("/profile");
        return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userRes, postsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/posts/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUser(userRes.data);
        setPosts(postsRes.data);
        setIsFollowing(userRes.data.isFollowing);
        setFollowedBy(userRes.data.followedBy);
      } catch (err) {
        console.error("❌ Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id, currentUser?._id, token, navigate]);

  // Real-time updates
  useEffect(() => {
    if (!token || !id) return;
    const socket = io(API, { auth: { token } });
    
    socket.on("relationship_updated", (data) => {
        if (data.fromId === id) {
           if (data.type === 'followed_you') setFollowedBy(true);
           if (data.type === 'unfollowed_you') setFollowedBy(false);
           if (data.followersCount !== undefined) {
               setUser(prev => ({ ...prev, followersCount: data.followersCount }));
           }
        }
        if (data.toId === id) {
            if (data.type === 'you_followed') setIsFollowing(true);
            if (data.type === 'you_unfollowed') setIsFollowing(false);
        }
    });

    return () => socket.disconnect();
  }, [API, token, id]);

  const handleFollow = async () => {
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setUser(prev => ({ 
        ...prev, 
        followersCount: wasFollowing ? Math.max(0, prev.followersCount - 1) : (prev.followersCount || 0) + 1 
    }));

    try {
      if (wasFollowing) {
        await axios.post(`${API_BASE_URL}/friends/${id}/unfollow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/friends/${id}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      setIsFollowing(wasFollowing);
      setUser(prev => ({ 
        ...prev, 
        followersCount: wasFollowing ? (prev.followersCount + 1) : Math.max(0, prev.followersCount - 1) 
      }));
    }
  };

  const handleMessage = () => {
    navigate(`/chat?userId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-100" />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Synchronizing Node Data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-xl border border-slate-100 mb-6">
          <ArrowLeft size={32} strokeWidth={1.5} className="cursor-pointer" onClick={() => navigate(-1)} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Node Not Found</h2>
        <p className="text-sm text-slate-400 font-medium">The requested transmission source is offline or restricted.</p>
      </div>
    );
  }

  const avatarUrl = getMediaUrl(user.avatar, "avatar", user.username);

  return (
    <div className="min-h-screen bg-mesh text-slate-900 dark:text-slate-100 pb-40 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50 relative overflow-x-hidden">
      <AestheticBackground />

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-blue-50 dark:border-slate-800 h-14 z-50 flex items-center justify-between px-4 shadow-sm dark:shadow-slate-900">
        <div className="flex items-center gap-4">
          <ArrowLeft size={22} strokeWidth={2.5} className="cursor-pointer text-slate-600 hover:text-blue-600 transition-colors" onClick={() => navigate(-1)} />
          <h1 className="text-lg font-black tracking-tighter lowercase text-slate-900 dark:text-white">@{user.username}</h1>
        </div>
        <div className="flex items-center gap-5">
          <Menu size={22} strokeWidth={2} className="text-slate-400" />
        </div>
      </header>

      <main className="pt-16 px-6 max-w-4xl mx-auto relative z-10">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-blue-50 dark:border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)] mb-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                {/* Avatar */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full animate-spin-slow opacity-20 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-2xl bg-slate-50">
                        <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Identity & Stats */}
                <div className="flex-1 flex flex-col gap-8 text-center md:text-left">
                    <div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                                <ShieldCheck size={10} strokeWidth={3} /> {user.role || "student"}
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                            {user.bio || "No bio defined for this node identity."}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-4">
                            <LinkIcon size={12} className="rotate-45" />
                            <span className="hover:underline cursor-pointer">{user.college?.name || "Independent Node"}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <motion.div whileHover={{ scale: 1.03 }} className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50 p-4 rounded-2xl text-center">
                            <p className="text-xl font-black text-indigo-600">{posts.length}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posts</p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ scale: 1.03 }}
                            onClick={() => setShowModal("followers")}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-center hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                        >
                            <p className="text-xl font-black text-slate-900 dark:text-white">{user.followersCount || 0}</p>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Followers</p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ scale: 1.03 }}
                            onClick={() => setShowModal("following")}
                            className="bg-white border border-slate-100 p-4 rounded-2xl text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                        >
                            <p className="text-xl font-black text-slate-900 dark:text-white">{user.followingCount || 0}</p>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Following</p>
                        </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isFollowing && followedBy ? (
                            <button onClick={handleFollow} className="flex-1 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm hover:bg-emerald-100 hover:shadow-lg">
                                Already Friends
                            </button>
                        ) : (
                            <button onClick={handleFollow} className={`flex-1 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isFollowing ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'}`}>
                                {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                {isFollowing ? "Following" : (followedBy ? "Follow Back" : "Follow")}
                            </button>
                        )}
                        <button onClick={handleMessage} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                            <MessageSquare size={16} /> Message
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Tabs */}
        <div className="flex justify-center border-t border-slate-100 dark:border-slate-700 relative mb-10">
            <div className="flex gap-8 md:gap-12">
                {[
                    { id: "grid", label: "POSTS", icon: Grid },
                    { id: "reels", label: "MEDIA", icon: Film },
                    { id: "tagged", label: "TAGGED", icon: UserSquare2 }
                ].map(tab => (
                    <motion.button
                        key={tab.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 border-t-2 transition-all duration-300 ${
                            activeTab === tab.id 
                            ? "border-indigo-600 text-indigo-600" 
                            : "border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        <tab.icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2.5} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-8">
            {posts.length > 0 ? (
                posts.map(post => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -8 }}
                        key={post._id} 
                        className="aspect-square bg-white rounded-[1.5rem] md:rounded-[3rem] relative group cursor-pointer overflow-hidden border border-blue-50 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500" 
                        onClick={() => navigate('/feed')}
                    >
                        {post.image ? (
                            <img src={getMediaUrl(post.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-6 text-center text-[10px] text-slate-400 font-bold leading-relaxed bg-slate-50 italic">
                                {post.content?.substring(0, 80)}...
                            </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white backdrop-blur-[2px]">
                            <div className="flex items-center gap-2">
                                <Heart size={20} fill="currentColor" />
                                <span className="font-black text-sm">{post.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageCircle size={20} fill="currentColor" />
                                <span className="font-black text-sm">{post.comments?.length || 0}</span>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="col-span-full py-32 text-center bg-white/50 rounded-[4rem] border border-dashed border-blue-100 shadow-sm">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-lg">
                        <Sparkles size={28} strokeWidth={1} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">No Posts Yet</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">This node has no public transmissions</p>
                </div>
            )}
        </div>

      </main>

      <AnimatePresence>
        {showModal && (
          <FollowModal 
            type={showModal} 
            userId={id} 
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
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 capitalize">{type}</h3>
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
                            <Link 
                                key={u._id} 
                                to={`/user/${u._id}`} 
                                onClick={onClose}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-slate-100"
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
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
