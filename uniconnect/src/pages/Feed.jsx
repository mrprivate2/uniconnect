import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  MessageCircle,
  MoreHorizontal,
  Send,
  ShieldAlert,
  LayoutGrid,
  Calendar,
  Store,
  Briefcase,
  Sparkles,
  MapPin,
  ShoppingBag,
  Trash2,
  Clock,
  Search
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { io } from "socket.io-client";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";
import toast from "react-hot-toast";
import ContentModal from "../components/ContentModal";

// 🛰️ HIGH-TECH UPLINK ANIMATION
const SatelliteUplink = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] border border-blue-500/10 rounded-full"
        >
            <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/2 left-0 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]" 
            />
        </motion.div>
        <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] border border-indigo-500/10 rounded-full"
        >
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-indigo-500 rounded-full opacity-40" />
        </motion.div>
    </div>
);

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "Global");
  
  const [posts, setPosts] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [events, setEvents] = useState([]);
  
  const [comments, setComments] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const API = API_BASE_URL.replace("/api", "");
  const token = localStorage.getItem("token");

  // Stable Fetcher
  const loadData = useCallback(async (pageNum, tab) => {
    try {
      setIsFetching(true);
      if (tab === "Global") {
        const res = await axios.get(`${API_BASE_URL}/posts?page=${pageNum}&limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const newPosts = res.data;
        if (newPosts.length < 10) setHasMore(false);
        setPosts(prev => {
            const filtered = pageNum === 1 ? [] : prev;
            const existingIds = new Set(filtered.map(p => p._id));
            const uniqueNew = newPosts.filter(p => !existingIds.has(p._id));
            return [...filtered, ...uniqueNew];
        });
      } else if (tab === "Exchange") {
        const res = await axios.get(`${API_BASE_URL}/posts/type/rent`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMarketItems(res.data || []);
      } else if (tab === "Engagements") {
        const res = await axios.get(`${API_BASE_URL}/posts/type/event`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  // Initial Load & Tab Switch
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadData(1, activeTab);
  }, [activeTab, loadData]);

  // Debugging: Log posts whenever they update
  useEffect(() => {
    if (posts.length > 0) {
      console.log("Current Feed Posts Data:", posts);
    }
  }, [posts]);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (page > 1 && activeTab === "Global") {
        loadData(page, activeTab);
    }
  }, [page, activeTab, loadData]);

  // Sentinel Observer
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && activeTab === "Global") {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetching, hasMore, activeTab]);

  // Persistent Real-time Comms
  useEffect(() => {
    if (!token) return;
    const socket = io(API, { auth: { token } });
    
    socket.on("new_post", (post) => {
        // Optimistically add to all relevant lists regardless of current tab
        setPosts(prev => {
            if (prev.find(p => p._id === post._id)) return prev;
            return [post, ...prev];
        });
        if (post.type === "event") setEvents(prev => [post, ...prev]);
        if (post.type === "rent") setMarketItems(prev => [post, ...prev]);
    });

    const handleUpdate = ({ postId, likes, comments: newComments }) => {
        const updater = (list) => list.map(p => {
            if (p._id !== postId) return p;
            const updated = { ...p };
            if (likes !== undefined) updated.likes = likes;
            if (newComments !== undefined) updated.comments = newComments;
            return updated;
        });
        setPosts(updater);
        setEvents(updater);
        setMarketItems(updater);
    };

    socket.on("like_updated", handleUpdate);
    socket.on("new_comment", handleUpdate);

    return () => socket.disconnect();
  }, [API, token]);

  const handleLike = async (postId) => {
    try {
      await axios.put(`${API_BASE_URL}/posts/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = comments[postId];
    if (!text) return;
    try {
      await axios.post(`${API_BASE_URL}/posts/${postId}/comment`, { text }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setComments({ ...comments, [postId]: "" });
      toast.success("Signal modulated.");
    } catch (err) {
      toast.error("Sync Failure.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("IRREVERSIBLE: Purge node?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filter = (l) => l.filter(p => p._id !== postId);
      setPosts(filter);
      setEvents(filter);
      setMarketItems(filter);
      toast.success("Node purged.");
    } catch (err) {
      toast.error("Termination failed.");
    }
  };

  const handleUpdateContent = (updated) => {
    const update = (list) => list.map(p => p._id === updated._id ? updated : p);
    setPosts(update);
    setEvents(update);
    setMarketItems(update);
  };

  const tabs = [
    { id: "Global", icon: LayoutGrid },
    { id: "Engagements", icon: Calendar },
    { id: "Exchange", icon: Store },
  ];

  const filteredPosts = posts.filter(p => 
    (p.content || p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.author?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-10 pb-40 px-4 flex flex-col items-center space-y-8 bg-mesh relative">
      <SatelliteUplink />
      
      {/* SEARCH & TABS */}
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input 
                type="text" 
                placeholder="Search the campus grid..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
            />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 rounded-[2rem] text-[10px] font-black tracking-[0.2em] transition-all duration-500 uppercase flex items-center gap-3 group shrink-0 ${
                activeTab === tab.id ? "bg-slate-900 text-white shadow-2xl shadow-slate-200" : "bg-white text-slate-400 border border-slate-100"
                }`}
            >
                <tab.icon size={14} className={`${activeTab === tab.id ? "text-indigo-400" : "text-slate-300"} transition-colors`} />
                {tab.id}
            </button>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "Global" && (
          <motion.div key="feed" className="w-full flex flex-col items-center space-y-8">
            {filteredPosts.map((post, index) => (
              <div key={post._id} ref={index === filteredPosts.length - 1 ? lastElementRef : null} className="w-full flex justify-center">
                <PostCard 
                  post={post} 
                  handleLike={handleLike}
                  handleDelete={handleDeletePost}
                  commentValue={comments[post._id] || ""}
                  setCommentValue={(val) => setComments({ ...comments, [post._id]: val })}
                  onCommentSubmit={() => handleCommentSubmit(post._id)}
                  onClick={() => setSelectedContent(post)}
                />
              </div>
            ))}
            {isFetching && hasMore && (
                <div className="py-10"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
            )}
            {!hasMore && filteredPosts.length > 0 && (
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest py-10">End of Sector Signal</p>
            )}
            {filteredPosts.length === 0 && !isFetching && (
                <div className="py-20 text-slate-300 uppercase text-[10px] font-black tracking-widest italic">Zero signals detected</div>
            )}
          </motion.div>
        )}

        {activeTab === "Exchange" && (
          <motion.div key="market" className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {marketItems.filter(i => (i.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
              <MarketCard key={item._id} item={item} onClick={() => setSelectedContent(item)} />
            ))}
            {marketItems.length === 0 && (
                <div className="col-span-full py-40 text-center flex flex-col items-center gap-8">
                  <div className="w-32 h-32 bg-white rounded-[3.5rem] flex items-center justify-center text-slate-100 shadow-2xl border border-slate-50">
                    <Store size={60} strokeWidth={1} />
                  </div>
                  <p className="text-slate-300 font-black text-xs uppercase tracking-[0.4em]">No artifacts found</p>
                </div>
            )}
          </motion.div>
        )}

        {activeTab === "Engagements" && (
          <motion.div key="events" className="w-full flex flex-col items-center space-y-8">
            {events.filter(e => (e.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map((event) => (
                <EventCard key={event._id} event={event} handleDelete={handleDeletePost} onClick={() => setSelectedContent(event)} />
            ))}
            {events.length === 0 && (
                <div className="w-full max-w-xl flex flex-col items-center justify-center py-40 bg-white/50 backdrop-blur-xl rounded-[4rem] border border-white shadow-xl text-center">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8 mx-auto">
                        <Calendar size={40} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Zero Engagements Found</h3>
                    <p className="text-slate-400 font-medium text-center max-w-xs uppercase tracking-widest text-[10px]">Synchronizing with university nodes...</p>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedContent && (
            <ContentModal 
                content={selectedContent} 
                onClose={() => setSelectedContent(null)} 
                onUpdate={handleUpdateContent}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({ event, handleDelete, onClick }) {
    const { user } = useAuth();
    return (
        <motion.div onClick={onClick} className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-sm border border-slate-50 cursor-pointer">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 leading-none mb-1">{event.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.location} • {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBD"}</p>
                    </div>
                </div>
                {user?._id === event.author_id && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }} className="text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
                )}
            </div>
            <p className="text-slate-600 font-medium mb-6">{event.content}</p>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100">
                        <img src={getMediaUrl(event.author?.avatar, "avatar", event.author?.username)} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.author?.name}</span>
                </div>
                <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Register Node</button>
            </div>
        </motion.div>
    );
}

function MarketCard({ item, onClick }) {
    return (
        <motion.div onClick={onClick} className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm group relative cursor-pointer">
            <div className="relative aspect-[5/6] overflow-hidden bg-slate-50 flex items-center justify-center">
                {item.image ? <img src={getMediaUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <ShoppingBag size={48} className="text-slate-200" />}
                <div className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl text-indigo-600"><Store size={18} /></div>
            </div>
            <div className="p-8">
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight line-clamp-1">{item.title}</h3>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-1">RATE</span>
                        <span className="text-2xl font-black text-slate-900">₹{item.price}</span>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><ShoppingBag size={20} /></div>
                </div>
            </div>
        </motion.div>
    );
}

function PostCard({ post, handleLike, handleDelete, commentValue, setCommentValue, onCommentSubmit, onClick }) {
  const { user } = useAuth();
  return (
    <motion.div 
      onClick={onClick} 
      className="bg-white w-full max-w-xl border border-slate-200 shadow-sm overflow-hidden md:rounded-sm mb-4 cursor-pointer"
    >
      {/* HEADER: Insta-style */}
      <div className="flex items-center justify-between px-3 py-3">
        <Link to={`/user/${post.author_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                <img src={getMediaUrl(post.author?.avatar, "avatar", post.author?.username)} className="w-full h-full object-cover" alt="" />
            </div>
            <span className="text-sm font-bold text-slate-900 hover:underline">{post.author?.username || post.author?.name}</span>
        </Link>
        <div className="flex items-center gap-2">
            {user?._id === post.author_id && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }} className="p-1 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
            )}
            <MoreHorizontal size={20} className="text-slate-400" />
        </div>
      </div>

      {/* MEDIA: Square Aspect Ratio */}
      <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
        {post.image ? (
          post.media_type === "video" ? (
            <video 
              src={getMediaUrl(post.image)} 
              controls 
              className="w-full h-full object-contain"
              onError={(e) => console.error("Video load error:", post.image)}
            />
          ) : (
            <img 
              src={getMediaUrl(post.image)} 
              className="w-full h-full object-cover" 
              alt="" 
              onError={(e) => {
                console.error("Image load error:", post.image);
                e.target.src = "https://via.placeholder.com/500?text=Error+Loading+Media";
              }}
            />
          )
        ) : (
          <div className="flex flex-col items-center text-slate-500 gap-2">
             <Sparkles size={40} strokeWidth={1} />
             <span className="text-[10px] font-bold uppercase tracking-widest">No Media Node</span>
          </div>
        )}
      </div>

      {/* ACTIONS bar */}
      <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-4 mb-2">
              <button onClick={(e) => { e.stopPropagation(); handleLike(post._id); }} className="transition-transform active:scale-125">
                  <Heart size={26} className={`${post.likes?.includes(user?._id) ? "text-rose-500 fill-rose-500" : "text-slate-800 hover:text-slate-500"}`} />
              </button>
              <button className="hover:text-slate-500 transition-colors">
                  <MessageCircle size={26} className="text-slate-800" />
              </button>
              <button className="hover:text-slate-500 transition-colors">
                  <Send size={24} className="text-slate-800 -rotate-12" />
              </button>
              <div className="ml-auto">
                  <ShieldAlert size={24} className="text-slate-200" />
              </div>
          </div>

          {/* LIKES & CAPTION */}
          <div className="space-y-1.5">
              <p className="text-sm font-bold text-slate-900">{post.likes?.length || 0} likes</p>
              <div className="text-sm leading-relaxed">
                  <span className="font-bold mr-2">{post.author?.username || post.author?.name}</span>
                  <span className="font-bold mr-2 text-indigo-600 uppercase text-[10px] tracking-widest">[{post.type || "Thought"}]</span>
                  <span className="text-slate-800 font-medium">{post.content || post.title}</span>
              </div>
              
              {post.comments?.length > 0 && (
                  <button className="text-sm text-slate-400 font-medium block mt-1 hover:text-slate-500">
                      View all {post.comments.length} comments
                  </button>
              )}
              
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">
                  {new Date(post.created_at || post.createdAt).toLocaleDateString()}
              </p>
          </div>
      </div>

      {/* QUICK COMMENT input */}
      <div className="px-4 py-3 border-t border-slate-100 mt-2 flex items-center gap-3">
        <input 
            type="text" 
            placeholder="Add a comment..." 
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)} 
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm outline-none placeholder:text-slate-400 text-slate-700 bg-transparent"
            onKeyDown={(e) => e.key === 'Enter' && onCommentSubmit()}
        />
        <button 
            onClick={(e) => { e.stopPropagation(); onCommentSubmit(); }} 
            className="text-sm font-bold text-indigo-500 hover:text-indigo-700 disabled:opacity-30 transition-colors" 
            disabled={!commentValue}
        >
            Post
        </button>
      </div>
    </motion.div>
  );
}
