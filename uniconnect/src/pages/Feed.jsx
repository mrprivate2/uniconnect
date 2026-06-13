import React, { useEffect, useState, useCallback, useRef, memo } from "react";
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
  Search,
  Globe
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { io } from "socket.io-client";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";
import toast from "react-hot-toast";
import ContentModal from "../components/ContentModal";

// ======================================
// 🐉 SVG MYTHICAL DRAGON COMPONENT
// ======================================
const FlyingDragon = ({ delay = 0, startX = -200, startY = 100, scaleVal = 1, flip = false }) => (
  <motion.div
    initial={{ x: startX, y: startY, opacity: 0 }}
    animate={{
      x: [startX, startX + 1200],
      y: [startY, startY - 80, startY + 40, startY - 40, startY + 20, startY],
      opacity: [0, 0.15, 0.2, 0.15, 0.1, 0],
    }}
    transition={{
      duration: 35,
      repeat: Infinity,
      ease: "linear",
      delay,
    }}
    className={`absolute will-change-transform ${flip ? 'scale-x-[-1]' : ''}`}
    style={{ transform: `scale(${scaleVal})` }}
  >
    {/* Dragon SVG - wing flapping via CSS animation */}
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dragon body */}
      <motion.path
        d="M20 55 C35 40, 50 35, 70 38 C85 40, 95 35, 100 30 L105 35 C98 42, 85 48, 70 46 C55 44, 40 48, 25 58 Z"
        fill="url(#dragonGrad)"
        className="opacity-80"
      />
      {/* Dragon head */}
      <motion.path
        d="M100 30 C105 24, 112 20, 115 22 C118 24, 116 30, 112 32 C108 34, 103 33, 100 30 Z"
        fill="url(#dragonHeadGrad)"
      />
      {/* Dragon eye */}
      <circle cx="110" cy="26" r="2" fill="#facc15" className="opacity-90">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Dragon horns */}
      <path d="M105 22 L108 14 L111 22" fill="#475569" className="opacity-60" />
      <path d="M110 20 L114 12 L116 20" fill="#475569" className="opacity-60" />
      {/* Dragon wings - flapping */}
      <motion.path
        animate={{ d: [
          "M45 40 C40 20, 25 5, 15 10 C20 18, 30 28, 40 38 Z",
          "M45 40 C40 30, 25 25, 15 30 C20 32, 30 34, 40 38 Z",
          "M45 40 C40 20, 25 5, 15 10 C20 18, 30 28, 40 38 Z",
        ]}}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        fill="url(#wingGrad)"
        className="opacity-60"
      />
      <motion.path
        animate={{ d: [
          "M65 42 C70 22, 85 8, 95 12 C90 20, 80 30, 70 40 Z",
          "M65 42 C70 32, 85 28, 95 32 C90 34, 80 36, 70 40 Z",
          "M65 42 C70 22, 85 8, 95 12 C90 20, 80 30, 70 40 Z",
        ]}}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        fill="url(#wingGrad)"
        className="opacity-60"
      />
      {/* Dragon tail */}
      <motion.path
        animate={{ d: [
          "M20 55 C10 60, 0 58, -5 50",
          "M20 55 C10 58, 0 55, -5 48",
          "M20 55 C10 60, 0 58, -5 50",
        ]}}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="opacity-60"
      />
      {/* Fire breath particles */}
      <motion.circle
        animate={{ cx: [118, 130, 140], cy: [28, 25, 22], r: [3, 2, 0], opacity: [0.8, 0.4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
        fill="#f97316"
      />
      <motion.circle
        animate={{ cx: [118, 135, 148], cy: [28, 30, 28], r: [2, 1.5, 0], opacity: [0.6, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
        fill="#facc15"
      />
      <motion.circle
        animate={{ cx: [118, 128, 136], cy: [28, 22, 18], r: [2.5, 1, 0], opacity: [0.7, 0.3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
        fill="#ef4444"
      />
      {/* Gradients */}
      <defs>
        <linearGradient id="dragonGrad" x1="20" y1="55" x2="105" y2="30">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="dragonHeadGrad" x1="100" y1="30" x2="116" y2="22">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="wingGrad" x1="15" y1="10" x2="45" y2="40">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

// ======================================
// 🔥 PHOENIX RISING COMPONENT
// ======================================
const RisingPhoenix = ({ delay = 0, startX = 100, id = 0 }) => (
  <motion.div
    initial={{ x: startX, y: 600, opacity: 0, scale: 0.3 }}
    animate={{
      x: [startX, startX + 80, startX - 30, startX + 50, startX],
      y: [600, 400, 250, 100, -50],
      opacity: [0, 0.12, 0.18, 0.12, 0],
      scale: [0.3, 0.5, 0.7, 0.5, 0.3],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
    className="absolute will-change-transform"
  >
    <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Phoenix body */}
      <motion.path
        animate={{ d: [
          "M40 80 C35 60, 30 50, 35 40 C38 34, 42 34, 45 40 C50 50, 45 60, 40 80 Z",
          "M40 80 C33 58, 28 48, 34 38 C38 32, 42 32, 46 38 C52 48, 47 58, 40 80 Z",
          "M40 80 C35 60, 30 50, 35 40 C38 34, 42 34, 45 40 C50 50, 45 60, 40 80 Z",
        ]}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        fill={`url(#phoenixBody-${id})`}
        className="opacity-70"
      />
      {/* Phoenix wings */}
      <motion.path
        animate={{ d: [
          "M35 42 C25 30, 10 25, 5 30 C12 35, 22 38, 35 42 Z",
          "M35 42 C20 35, 8 35, 5 40 C12 40, 22 40, 35 42 Z",
          "M35 42 C25 30, 10 25, 5 30 C12 35, 22 38, 35 42 Z",
        ]}}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        fill={`url(#phoenixWing-${id})`}
        className="opacity-50"
      />
      <motion.path
        animate={{ d: [
          "M45 42 C55 30, 70 25, 75 30 C68 35, 58 38, 45 42 Z",
          "M45 42 C60 35, 72 35, 75 40 C68 40, 58 40, 45 42 Z",
          "M45 42 C55 30, 70 25, 75 30 C68 35, 58 38, 45 42 Z",
        ]}}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        fill={`url(#phoenixWing-${id})`}
        className="opacity-50"
      />
      {/* Phoenix tail feathers */}
      <motion.path
        animate={{ d: [
          "M40 80 C38 85, 32 92, 25 95",
          "M40 80 C38 84, 32 90, 25 92",
          "M40 80 C38 85, 32 92, 25 95",
        ]}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        stroke="#f97316"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="opacity-50"
      />
      <motion.path
        animate={{ d: [
          "M40 80 C42 85, 48 92, 55 95",
          "M40 80 C42 84, 48 90, 55 92",
          "M40 80 C42 85, 48 92, 55 95",
        ]}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        stroke="#facc15"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="opacity-50"
      />
      {/* Phoenix glow */}
      <motion.circle
        cx="40" cy="50" r="25"
        animate={{ r: [25, 30, 25], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        fill="#f97316"
        filter={`url(#phoenixGlow-${id})`}
      />
      {/* Gradients & Filters */}
      <defs>
        <filter id={`phoenixGlow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        </filter>
        <linearGradient id={`phoenixBody-${id}`} x1="30" y1="80" x2="50" y2="34">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#facc15" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`phoenixWing-${id}`} x1="5" y1="30" x2="35" y2="42">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

// ======================================
// ✨ MAGIC SPARKLE PARTICLE
// ======================================
const SparkleParticle = ({ delay = 0, x = 0 }) => (
  <motion.div
    initial={{ x, y: 300, opacity: 0, scale: 0 }}
    animate={{
      y: [300, -100],
      opacity: [0, 0.4, 0.6, 0.2, 0],
      scale: [0, 1, 1.5, 0.8, 0],
      rotate: [0, 180, 360],
    }}
    transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay, ease: "easeOut" }}
    className="absolute will-change-transform"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <motion.path
        d="M8 0 C8 0, 10 6, 16 8 C10 10, 8 16, 8 16 C8 16, 6 10, 0 8 C6 6, 8 0, 8 0 Z"
        fill="#818cf8"
        className="opacity-70"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  </motion.div>
);

// ======================================
// 🔮 MYSTICAL RUNE SYMBOL
// ======================================
const MysticalRune = ({ delay = 0, x = 0 }) => (
  <motion.div
    initial={{ x, y: 500, opacity: 0, rotate: 0 }}
    animate={{
      y: [500, 200, -50],
      opacity: [0, 0.1, 0.08, 0],
      rotate: [0, 90, 180],
    }}
    transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute will-change-transform"
  >
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <motion.circle
        cx="15" cy="15" r="10"
        stroke="#a78bfa"
        strokeWidth="1"
        fill="none"
        className="opacity-40"
        animate={{ r: [10, 12, 10], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.path
        d="M15 5 L15 25 M5 15 L25 15"
        stroke="#a78bfa"
        strokeWidth="1"
        className="opacity-30"
        animate={{ rotate: [0, 45, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.circle
        cx="15" cy="15" r="3"
        fill="#818cf8"
        className="opacity-40"
        animate={{ r: [3, 5, 3], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </svg>
  </motion.div>
);

// ======================================
// 🌟 EPIC BACKGROUND ANIMATION
// ======================================
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
    {/* Shifting aurora spotlights */}
    <motion.div
      animate={{ x: [-80, 80, -80], y: [-40, 40, -40], scale: [1, 1.15, 1] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-400/8 via-indigo-400/5 to-transparent rounded-full blur-[120px]"
    />
    <motion.div
      animate={{ x: [80, -80, 80], y: [40, -40, 40], scale: [1.15, 1, 1.15] }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-indigo-400/8 via-blue-400/5 to-transparent rounded-full blur-[120px]"
    />
    
    {/* 🐉 Flying Dragons */}
    <FlyingDragon delay={0} startX={-150} startY={80} scaleVal={0.8} />
    <FlyingDragon delay={16} startX={-250} startY={250} scaleVal={0.55} flip />
    
    {/* 🔥 Rising Phoenix */}
    <RisingPhoenix delay={0} startX={80} id={0} />
    <RisingPhoenix delay={12} startX={400} id={1} />
    
    {/* ✨ Magic Sparkles */}
    <SparkleParticle delay={0} x={60} />
    <SparkleParticle delay={2.5} x={180} />
    <SparkleParticle delay={5} x={300} />
    <SparkleParticle delay={7.5} x={140} />
    <SparkleParticle delay={10} x={380} />
    
    {/* 🔮 Mystical Runes */}
    <MysticalRune delay={0} x={40} />
    <MysticalRune delay={6} x={200} />
    <MysticalRune delay={12} x={320} />
    <MysticalRune delay={18} x={460} />
    
    {/* Floating glass orbs */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`, opacity: 0 }}
        animate={{
          y: ["110vh", "-10vh"],
          x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
          opacity: [0, 0.08, 0.08, 0],
        }}
        transition={{
          duration: Math.random() * 25 + 25,
          repeat: Infinity,
          ease: "linear",
          delay: -Math.random() * 30,
        }}
        className="absolute rounded-full bg-white/10 border border-white/20 backdrop-blur-[2px] will-change-transform"
        style={{
          width: `${Math.random() * 120 + 60}px`,
          height: `${Math.random() * 120 + 60}px`,
        }}
      />
    ))}
    
    {/* Satellite orbit rings */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      className="absolute top-[15%] right-[5%] w-[400px] h-[400px] border border-blue-400/8 rounded-full"
    >
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-1/2 left-0 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_12px_#3b82f6]"
      />
    </motion.div>
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] border border-indigo-400/8 rounded-full"
    >
      <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-30" />
    </motion.div>
  </div>
);

// ============================
// 🔄 SKELETON LOADING SHIMMER
// ============================
const PostCardSkeleton = () => (
  <div className="w-full max-w-xl rounded-[2rem] border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm dark:shadow-slate-900 mb-6">
    <div className="flex items-center gap-3 px-6 py-5 animate-pulse">      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-2">
                <div className="w-28 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="w-16 h-2 bg-slate-100 dark:bg-slate-600 rounded-full" />
              </div>
    </div>
    <div className="aspect-square bg-slate-100 dark:bg-slate-800 animate-pulse" />
    <div className="px-6 pt-5 pb-4 space-y-3 animate-pulse">
      <div className="flex gap-5">
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="w-3/4 h-3 bg-slate-100 dark:bg-slate-700 rounded-full" />
      <div className="w-1/2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full" />
    </div>
  </div>
);

// ============================
// 🎯 STAGGER VARIANTS
// ============================
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 20, mass: 0.8 },
  },
};

// ============================
// 🖼 MAIN FEED COMPONENT
// ============================
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
  const [initialLoading, setInitialLoading] = useState(true);

  const API = API_BASE_URL.replace("/api", "");
  const token = localStorage.getItem("token");

  const loadData = useCallback(async (pageNum, tab) => {
    try {
      setIsFetching(true);
      if (tab === "Global") {
        const res = await axios.get(`${API_BASE_URL}/posts?page=${pageNum}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newPosts = res.data;
        if (newPosts.length < 10) setHasMore(false);
        setPosts((prev) => {
          const filtered = pageNum === 1 ? [] : prev;
          const existingIds = new Set(filtered.map((p) => p._id));
          const uniqueNew = newPosts.filter((p) => !existingIds.has(p._id));
          return [...filtered, ...uniqueNew];
        });
      } else if (tab === "Exchange") {
        const res = await axios.get(`${API_BASE_URL}/posts/type/rent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMarketItems(res.data || []);
      } else if (tab === "Engagements") {
        const res = await axios.get(`${API_BASE_URL}/posts/type/event`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, [token]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    loadData(1, activeTab);
  }, [activeTab, loadData]);

  useEffect(() => {
    if (page > 1 && activeTab === "Global") {
      loadData(page, activeTab);
    }
  }, [page, activeTab, loadData]);

  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && activeTab === "Global") {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore, activeTab]
  );

  // Real-time socket
  useEffect(() => {
    if (!token) return;
    const socket = io(API, { auth: { token } });

    socket.on("new_post", (post) => {
      setPosts((prev) => {
        if (prev.find((p) => p._id === post._id)) return prev;
        return [post, ...prev];
      });
      if (post.type === "event") setEvents((prev) => [post, ...prev]);
      if (post.type === "rent") setMarketItems((prev) => [post, ...prev]);
    });

    const handleUpdate = ({ postId, likes, comments: newComments }) => {
      const updater = (list) =>
        list.map((p) => {
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const filter = (l) => l.filter((p) => p._id !== postId);
      setPosts(filter);
      setEvents(filter);
      setMarketItems(filter);
      toast.success("Node purged.");
    } catch (err) {
      toast.error("Termination failed.");
    }
  };

  const handleUpdateContent = (updated) => {
    const update = (list) => list.map((p) => (p._id === updated._id ? updated : p));
    setPosts(update);
    setEvents(update);
    setMarketItems(update);
  };

  const handleReportPost = async (postId) => {
    const reason = window.prompt("Reason for flagging this node (e.g., Spam, Harassment, Inappropriate):");
    if (!reason) return;
    try {
      await axios.post(`${API_BASE_URL}/reports`, { postId, reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Threat report transmitted to admin sector.");
    } catch (err) {
      toast.error("Report transmission failed.");
    }
  };

  const tabs = [
    { id: "Global", icon: LayoutGrid },
    { id: "Engagements", icon: Calendar },
    { id: "Exchange", icon: Store },
  ];

  const filteredPosts = posts.filter(
    (p) =>
      (p.content || p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.author?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-3 sm:pt-4 pb-28 sm:pb-40 px-2 sm:px-4 flex flex-col items-center space-y-4 sm:space-y-6 bg-mesh relative dark:text-slate-100">
      <AnimatedBackground />        {/* HEADER */}        <div className="w-full max-w-xl flex flex-col gap-4 sm:gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-[0.25em] mb-2 border border-indigo-100 dark:border-indigo-800/50">
              <Globe size={10} strokeWidth={3} /> Campus Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              The <span className="text-gradient">Feed.</span>
            </h1>
          </div>
          {user && (              <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create")}
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-lg shadow-slate-200 dark:shadow-slate-900 flex items-center gap-1.5 sm:gap-2"
            >
              <Sparkles size={10} className="sm:w-3 sm:h-3" /> Post
            </motion.button>
          )}
        </div>

        {/* SEARCH */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search the campus grid..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-700 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all shadow-sm"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                layout
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-[1.5rem] text-[8px] sm:text-[10px] font-black tracking-[0.15em] transition-all uppercase flex items-center gap-1.5 sm:gap-2.5 shrink-0 ${
                  isActive
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200/50 dark:shadow-slate-900"
                    : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-400 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <tab.icon
                  size={13}
                  className={`${isActive ? "text-indigo-400" : "text-slate-300 dark:text-slate-500"} transition-colors`}
                />
                {tab.id}
                {isActive && (
                  <motion.div
                    layoutId="tabGlow"
                    className="absolute inset-0 rounded-[1.5rem] ring-2 ring-indigo-400/20"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "Global" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {initialLoading ? (
                <div className="w-full max-w-xl space-y-6">
                  {[1, 2, 3].map((i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="w-full flex flex-col items-center"
                >
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      variants={cardVariants}
                      ref={index === filteredPosts.length - 1 ? lastElementRef : null}
                      className="w-full flex justify-center"
                    >
                      <PostCard
                        post={post}
                        handleLike={handleLike}
                        handleDelete={handleDeletePost}
                        handleReport={handleReportPost}
                        commentValue={comments[post._id] || ""}
                        setCommentValue={(val) => setComments({ ...comments, [post._id]: val })}
                        onCommentSubmit={() => handleCommentSubmit(post._id)}
                        onClick={() => setSelectedContent(post)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-xl py-24 text-center flex flex-col items-center gap-6 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-white/50 dark:border-slate-700/50 shadow-sm"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-lg">
                    <Sparkles size={36} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Zero Signals Detected</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest max-w-xs">
                    The campus grid is silent. Be the first to broadcast.
                  </p>
                </motion.div>
              )}
              {isFetching && hasMore && (
                <div className="py-10 flex items-center gap-3 text-slate-300 dark:text-slate-500">
                  <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Loading more...</span>
                </div>
              )}
              {!hasMore && filteredPosts.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest py-10"
                >
                  — End of Sector Signal —
                </motion.p>
              )}
            </motion.div>
          )}

          {activeTab === "Exchange" && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {marketItems
                .filter((i) => (i.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                  <MarketCard key={item._id} item={item} onClick={() => setSelectedContent(item)} />
                ))}
              {marketItems.length === 0 && (
                <div className="col-span-full py-40 text-center flex flex-col items-center gap-8">
                  <div className="w-32 h-32 bg-white/70 backdrop-blur-xl rounded-[3.5rem] flex items-center justify-center text-slate-200 shadow-2xl border border-white">
                    <Store size={60} strokeWidth={1} />
                  </div>
                  <p className="text-slate-300 dark:text-slate-500 font-black text-xs uppercase tracking-[0.4em]">No artifacts found in current sector</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Engagements" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center space-y-8"
            >
              {events
                .filter((e) => (e.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
                .map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    handleDelete={handleDeletePost}
                    onClick={() => setSelectedContent(event)}
                  />
                ))}
              {events.length === 0 && (
                <div className="w-full max-w-xl py-32 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white shadow-xl text-center px-8">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8 mx-auto shadow-lg shadow-indigo-100/50">
                    <Calendar size={40} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Zero Engagements Found</h3>
                  <p className="text-slate-400 font-medium text-center max-w-xs uppercase tracking-widest text-[10px]">
                    Synchronizing with university nodes...
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

// ============================
// 📅 EVENT CARD
// ============================
const EventCard = memo(function EventCard({ event, handleDelete, onClick }) {
  const { user } = useAuth();
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-xl p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/8 border border-slate-50 dark:border-slate-700 cursor-pointer transition-all duration-500 group dark:text-slate-100"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
          >
            <Calendar size={22} />
          </motion.div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {event.title}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {event.location || "Campus"} •{" "}
              {event.event_date ? new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
            </p>
          </div>
        </div>
        {user?._id === event.author_id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(event._id);
            }}
            className="text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <p className="text-slate-600 font-medium mb-6 leading-relaxed">{event.content}</p>
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-50">
            <img
              src={getMediaUrl(event.author?.avatar, "avatar", event.author?.username)}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {event.author?.name}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
        >
          Register Node
        </motion.button>
      </div>
    </motion.div>
  );
});

// ============================
// 🏪 MARKET CARD
// ============================
const MarketCard = memo(function MarketCard({ item, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 group cursor-pointer"
    >
      <div className="relative aspect-[5/6] overflow-hidden bg-slate-50 flex items-center justify-center">
        {item.image ? (
          <img
            src={getMediaUrl(item.image)}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ShoppingBag size={48} className="text-slate-200" />
          </motion.div>
        )}
        <div className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl text-indigo-600 border border-white/50">
          <Store size={18} />
        </div>
        <div className="absolute inset-x-6 bottom-6 translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
            <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <MapPin size={10} className="text-indigo-500" /> Campus Hub
            </p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
          For Rent
        </span>            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase mb-1 tracking-widest">Daily Rate</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹{item.price}</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-100 group-hover:border-indigo-500"
          >
            <ShoppingBag size={20} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

// ============================
// 📄 POST CARD
// ============================
const PostCard = memo(function PostCard({ post, handleLike, handleDelete, handleReport, commentValue, setCommentValue, onCommentSubmit, onClick }) {
  const { user } = useAuth();
  // Track like clicks for animation trigger (server state from post.likes)
  const isLiked = post.likes?.includes(user?._id);
  const [likeAnimTrigger, setLikeAnimTrigger] = useState(0);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    handleDelete(post._id);
  };

  const handleReportClick = (e) => {
    e.stopPropagation();
    handleReport(post._id);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setLikeAnimTrigger(prev => prev + 1);
    handleLike(post._id);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden mb-6 cursor-pointer group"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          to={`/user/${post.author_id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 group/author"
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full opacity-0 group-hover/author:opacity-100 transition-opacity duration-500 blur-[1px]" />
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img
                src={getMediaUrl(post.author?.avatar, "avatar", post.author?.username)}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-400 transition-colors">
              {post.author?.username || post.author?.name}
            </span>
            <p className="text-[9px] font-medium text-slate-400">
              {new Date(post.created_at || post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {user?._id === post.author_id && (
            <button
              onClick={handleDeleteClick}
              className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={handleReportClick}
            className="p-2.5 text-slate-300 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
          >
            <ShieldAlert size={16} />
          </button>
        </div>
      </div>

      {/* MEDIA */}
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
        {post.image ? (
          post.media_type === "video" ? (
            <video
              src={getMediaUrl(post.image)}
              controls
              className="w-full h-full object-cover"
              onError={(e) => console.error("Video load error:", post.image)}
            />
          ) : (
            <img
              src={getMediaUrl(post.image)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt=""
              onError={(e) => {
                console.error("Image load error:", post.image);
                e.target.src = "https://via.placeholder.com/500?text=Error+Loading+Media";
              }}
            />
          )
        ) : (
          <div className="flex flex-col items-center text-slate-300 gap-3 group-hover:scale-105 transition-transform duration-500">
            <Sparkles size={48} strokeWidth={1} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">No Media</span>
          </div>
        )}
      </div>

      {/* ACTIONS BAR */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-6 mb-4">
          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={handleLikeClick}
            className="transition-all hover:scale-110"
          >
            <motion.div
              animate={likeAnimTrigger > 0 ? { scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Heart
                size={22}
                className={`${
                  isLiked ? "text-rose-500 fill-rose-500" : "text-slate-600 hover:text-rose-500"
                } transition-colors`}
              />
            </motion.div>
          </motion.button>
          <button className="text-slate-600 hover:text-indigo-600 transition-all hover:scale-110">
            <MessageCircle size={22} />
          </button>
          <button className="text-slate-600 hover:text-indigo-600 transition-all hover:scale-110">
            <Send size={20} className="-rotate-12" />
          </button>
          <button className="ml-auto text-slate-400 hover:text-indigo-600 transition-all hover:scale-110">
            <Share2 size={20} />
          </button>
        </div>

        {/* LIKES & CAPTION */}
        <div className="space-y-2">            <p className="text-sm font-bold text-slate-900 dark:text-white">
            {post.likes?.length || 0} likes
          </p>
          <div className="text-sm leading-relaxed">
            <span className="font-bold mr-1.5">{post.author?.username || post.author?.name}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold uppercase tracking-wider mr-1.5 border border-indigo-100">
              {post.type || "post"}
            </span>
            <span className="text-slate-700 dark:text-slate-300">{post.content || post.title}</span>
          </div>

          {post.comments?.length > 0 && (
            <button className="text-sm text-slate-400 font-medium block mt-1.5 hover:text-indigo-500 transition-colors">
              View all {post.comments.length} comments
            </button>
          )}

          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
            {new Date(post.created_at || post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* QUICK COMMENT */}
      <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3 bg-slate-50/30 dark:bg-slate-800/30 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-colors">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentValue}
          onChange={(e) => setCommentValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-sm outline-none placeholder:text-slate-400 text-slate-700 bg-transparent"
          onKeyDown={(e) => e.key === "Enter" && onCommentSubmit()}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onCommentSubmit();
          }}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-30 transition-all px-4 py-2 hover:bg-indigo-50 rounded-xl"
          disabled={!commentValue}
        >
          Post
        </motion.button>
      </div>
    </motion.div>
  );
});
