import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid, Film, UserSquare2, Menu, ChevronDown, 
  Link as LinkIcon, Camera, MessageSquare,
  UserPlus, UserMinus, Share, ArrowLeft, X
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";

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
  const [showModal, setShowModal] = useState(null); // 'followers' or 'following'
  
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <ArrowLeft className="mb-4 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-xl font-bold">User node not found</h2>
        <p className="text-slate-500">The requested transmission source is offline or restricted.</p>
      </div>
    );
  }

  const avatarUrl = getMediaUrl(user.avatar, "avatar", user.username);

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans">
      
      {/* 📱 TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 h-14 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <ArrowLeft size={24} className="cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold tracking-tight lowercase">{user.username}</h1>
        </div>
        <div className="flex items-center gap-5">
          <Menu size={24} strokeWidth={2} />
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">
        
        {/* 👤 PROFILE HEADER */}
        <div className="flex items-center gap-8 mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] bg-gradient-to-tr from-indigo-100 to-indigo-500">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <img 
                src={avatarUrl} 
                alt={user.username}
                className="w-full h-full rounded-full object-cover bg-slate-50"
              />
            </div>
          </div>

          <div className="flex-1 flex justify-between px-2">
            {[
              { label: "Posts", value: posts.length, onClick: null },
              { label: "Followers", value: user.followersCount || 0, onClick: () => setShowModal('followers') },
              { label: "Following", value: user.followingCount || 0, onClick: () => setShowModal('following') }
            ].map(stat => (
              <div key={stat.label} className={`flex flex-col items-center ${stat.onClick ? 'cursor-pointer' : ''}`} onClick={stat.onClick}>
                <span className="text-base font-bold text-slate-900">{stat.value}</span>
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📝 BIO SECTION */}
        <div className="mb-6 px-1">
          <h2 className="text-sm font-bold mb-0.5">{user.name}</h2>
          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-tight mb-1">
            {user.bio || "No bio yet."}
          </p>
          <div className="flex items-center gap-1.5 text-blue-900 font-semibold text-sm">
            <LinkIcon size={14} className="rotate-45" />
            <span className="hover:underline cursor-pointer">{user.college?.name || "Independent Node"}</span>
          </div>
        </div>

        {/* ⚙️ ACTION BUTTONS */}
        <div className="flex gap-2 mb-10">
          {isFollowing && followedBy ? (
              <button 
                onClick={handleFollow}
                className="flex-1 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm hover:bg-emerald-100"
              >
                Already Friends
              </button>
          ) : (
              <button 
                onClick={handleFollow}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isFollowing ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
              >
                {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                {isFollowing ? "Following" : (followedBy ? "Follow Back" : "Follow")}
              </button>
          )}
          <button 
            onClick={handleMessage}
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageSquare size={16} /> Message
          </button>
        </div>

        {/* 📑 TABS SECTION */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "grid", icon: Grid },
            { id: "reels", icon: Film },
            { id: "tagged", icon: UserSquare2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex justify-center py-3 relative ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'}`}
            >
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-900" />
              )}
            </button>
          ))}
        </div>

        {/* 🖼 POSTS GRID */}
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="aspect-square bg-slate-100 relative group cursor-pointer overflow-hidden" onClick={() => navigate('/feed')}>
                {post.image ? (
                  <img src={getMediaUrl(post.image)} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-slate-400 font-bold uppercase">
                    {post.content?.substring(0, 20)}...
                  </div>
                )}
                {(post.media_type === 'video' || post.mediaType === 'video') && (
                  <Film className="absolute top-2 right-2 text-white drop-shadow-md" size={16} />
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 text-center text-slate-300 uppercase text-[10px] font-black tracking-widest">
                No signals found
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
                className="relative bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[60vh]"
            >
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{type}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="py-10 flex flex-col items-center gap-4 text-slate-300">
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-10 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                            No {type} found
                        </div>
                    ) : (
                        users.map(u => (
                            <Link 
                                key={u._id} 
                                to={`/user/${u._id}`} 
                                onClick={onClose}
                                className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group"
                            >
                                <img src={getMediaUrl(u.avatar, "avatar", u.username)} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{u.username}</p>
                                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{u.name}</p>
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
