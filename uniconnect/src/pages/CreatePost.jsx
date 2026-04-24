import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Image as ImageIcon, X, Globe, Lock, 
  MessageSquare, Calendar, Briefcase, Store, Tag, IndianRupee, ArrowRight, Video, FileVideo, ShieldCheck,
  ChevronLeft, MapPin, Info, Clock, Terminal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

// Local Helper Components
function CommandIcon({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM6 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3 3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"/>
        </svg>
    )
}

function ZapIcon({ size, className, fill }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
    )
}

export default function CreatePost() {
  const navigate = useNavigate();
  const [type, setType] = useState("thought");
  
  // State for all potential fields
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [category, setCategory] = useState("Technology");
  
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const token = localStorage.getItem("token");

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
          setValidationError("Payload too large. Max protocol limit: 50MB");
          return;
      }
      setMedia(file);
      const isVideo = file.type.startsWith("video");
      setMediaType(isVideo ? "video" : "image");
      
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
      setValidationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
        setValidationError("Payload content is required for transmission.");
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", title || (type === "thought" ? "Campus Thought" : "New Listing"));
    formData.append("content", content);
    
    // Conditional Appends
    if (price) formData.append("price", price);
    if (location) formData.append("location", location);
    if (eventDate) formData.append("eventDate", eventDate);
    if (category) formData.append("category", category);
    if (media) formData.append("media", media);

    try {
      await axios.post(`${API_BASE_URL}/posts`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      navigate("/feed");
    } catch (err) {
      console.error(err);
      setValidationError(err.response?.data?.error || "Transmission Protocol Failure.");
      setIsUploading(false);
    }
  };

  const categories = ["Technology", "Design", "Business", "Research", "Leisure"];

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] font-sans bg-mesh overflow-hidden">
      
      {/* COMPACT SIDEBAR: System Status */}
      <div className="w-full lg:w-[320px] bg-slate-900 flex flex-col justify-between p-8 text-white relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent)]" />
        
        <div className="relative z-10">
            <button 
                onClick={() => navigate(-1)}
                className="mb-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Abort Session</span>
            </button>

            <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/10">
                    <ZapIcon size={16} className="text-indigo-400" fill="currentColor" />
                </div>
                <span className="text-xs font-black tracking-tighter uppercase italic">Uni<span className="text-indigo-400">Connect</span></span>
            </div>

            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 text-indigo-300 text-[8px] font-black uppercase tracking-[0.2em] mb-6 border border-white/5">
                <ShieldCheck size={10} strokeWidth={3} /> Node Secure
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter leading-[0.9] mb-4 text-white">
                Initialize<br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-5xl">Broadcast.</span>
            </h1>
            
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[220px]">
                Configure and encrypt your transmission payload for the university network backbone.
            </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Protocol Active</p>
            </div>
            <footer className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">
                V.1.4.2-STABLE © 2026
            </footer>
        </div>
      </div>

      {/* CORE CONFIGURATION: Protocol Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-10 relative overflow-hidden bg-mesh">
          
          <AnimatePresence>
            {validationError && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-10 z-50 bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl flex items-center gap-3 text-rose-600 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100/50"
                >
                    <Terminal size={14} strokeWidth={3} />
                    {validationError}
                    <button onClick={() => setValidationError("")} className="ml-4 hover:rotate-90 transition-transform"><X size={14} /></button>
                </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.02)] border border-slate-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-8 px-1">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Transmission Hub</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Synchronization Mode</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
                    <CommandIcon size={16} />
                </div>
            </div>

            {/* COMPACT TYPE TABS */}
            <div className="flex gap-1.5 mb-8 bg-slate-50/80 p-1 rounded-xl border border-slate-100/50">
                {[
                    { id: "thought", label: "THOUGHT", icon: MessageSquare },
                    { id: "event", label: "EVENT", icon: Calendar },
                    { id: "recruitment", label: "CAREER", icon: Briefcase },
                    { id: "rent", label: "MARKET", icon: Store },
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                            setType(tab.id);
                            setValidationError("");
                        }}
                        className={`flex-1 py-2.5 px-2 rounded-lg text-[8px] font-black tracking-widest flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                            type === tab.id 
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                            : "text-slate-400 hover:text-slate-600 hover:bg-white"
                        }`}
                    >
                        <tab.icon size={11} strokeWidth={3} /> {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={type}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* ALL TYPES GET A HEADER/TITLE */}
                            <div className="relative">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Node Alias / Header</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder={type === 'rent' ? "Artifact ID" : type === 'thought' ? "Thought Header" : "Transmission Title"}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                />
                            </div>

                            {/* CONDITIONAL FIELDS BY TYPE */}
                            {type === 'rent' && (
                                <div className="relative">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Exchange Rate</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</div>
                                        <input 
                                            type="number"
                                            required
                                            placeholder="0.00"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-5 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {type === 'event' && (
                                <>
                                    <div className="relative">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Sync Date</label>
                                        <input 
                                            type="date"
                                            required
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Grid Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
                                            <input 
                                                type="text"
                                                required
                                                placeholder="Auditorium / Tech Lab"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-5 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {(type === 'recruitment' || type === 'rent') && (
                                <div className="relative">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Classification</label>
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="flex justify-between items-center mb-2 ml-2">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Payload Content</label>
                                <span className={`text-[8px] font-black tracking-widest ${content.length > 450 ? 'text-rose-500' : 'text-slate-300'}`}>
                                    {content.length} / 500
                                </span>
                            </div>
                            <textarea 
                                placeholder={type === 'thought' ? "Broadcast pulse..." : "Detailed specifications and requirements..."}
                                value={content}
                                maxLength={500}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-[100px] bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none font-medium leading-relaxed shadow-sm"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* COMPACT MULTIMEDIA ATTACHMENT */}
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 group hover:bg-white hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden">
                    <input 
                        type="file" 
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    {mediaPreview ? (
                        <div className="relative w-full min-h-[140px] flex items-center justify-center">
                             {mediaType === 'video' ? (
                                <video src={mediaPreview} className="max-h-32 rounded-xl shadow-lg" controls />
                             ) : (
                                <img src={mediaPreview} className="max-h-32 rounded-xl shadow-lg object-contain" />
                             )}
                             <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); setMedia(null); setMediaPreview(null); setMediaType(null); }} 
                                className="absolute -top-1 -right-1 p-2.5 bg-slate-900 text-white rounded-full shadow-xl hover:bg-black transition-all z-30 scale-75"
                             >
                                <X size={14} strokeWidth={3} />
                             </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-1">
                            <div className="flex gap-3 mb-3">
                                <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-all duration-500 border border-slate-50">
                                    <ImageIcon size={18} strokeWidth={2.5} />
                                </div>
                                <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-sky-500 transition-all duration-500 border border-slate-100">
                                    <Video size={18} strokeWidth={2.5} />
                                </div>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Link Media Node</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 text-indigo-500">
                        <Info size={14} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 leading-tight uppercase tracking-tight">
                        Your transmission will be validated against community guidelines before global propagation.
                    </p>
                </div>

                <button 
                    type="submit"
                    disabled={isUploading || !content}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2.5 hover:bg-black hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-30 shadow-xl shadow-slate-100"
                >
                    {isUploading ? (
                        <>UPLOADING PROTOCOL...</>
                    ) : (
                        <>TRANSMIT TO NETWORK <ArrowRight size={14} strokeWidth={3} /></>
                    )}
                </button>
            </form>
          </motion.div>
      </div>

    </div>
  );
}
