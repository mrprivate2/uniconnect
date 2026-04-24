import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Heart, MessageCircle, Send, Share2, 
  MapPin, Calendar, Briefcase, Store, Tag,
  Clock, ShieldCheck, Zap, UserPlus, Trash2, ArrowRight, MessageSquare
} from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";
import toast from "react-hot-toast";

export default function ContentModal({ content: initialContent, onClose, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState(initialContent);
  const [newComment, setNewMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialContent.content || initialContent.title || "");
  const token = localStorage.getItem("token");

  // Handle Like
  const handleLike = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/posts/${content._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...content, likes: res.data.likes };
      setContent(updated);
      onUpdate && onUpdate(updated);
    } catch (err) {
      toast.error("Transmission failed.");
    }
  };

  // Handle Comment
  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/posts/${content._id}/comment`, { text: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...content, comments: res.data.comments };
      setContent(updated);
      setNewMessage("");
      onUpdate && onUpdate(updated);
      toast.success("Comment encrypted and transmitted.");
    } catch (err) {
      toast.error("Failed to sync comment.");
    }
  };

  // Handle Apply / RSVP / Contact
  const handleApply = async () => {
    if (content.type === 'rent') {
      onClose();
      navigate(`/chat?userId=${content.author_id}`);
      return;
    }
    setIsApplying(true);
    try {
      await axios.post(`${API_BASE_URL}/posts/${content._id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(content.type === 'event' ? "Registration protocol complete." : "Application transmitted to node.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Protocol restricted.");
    } finally {
      setIsApplying(false);
    }
  };

  // Handle Edit
  const handleEdit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/posts/${content._id}`, { content: editValue }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...content, content: editValue };
      setContent(updated);
      setIsEditing(false);
      onUpdate && onUpdate(updated);
      toast.success("Node data updated.");
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const [showApplicants, setShowApplicants] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-6xl h-[90vh] md:h-[85vh] rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row bg-mesh"
        >
          {/* LEFT: MEDIA & CONTENT */}
          <div className="w-full md:w-[60%] h-[40%] md:h-full bg-slate-50 border-r border-slate-100 relative group">
              {content.image ? (
                  <div className="w-full h-full flex items-center justify-center p-8">
                      {content.media_type === 'video' ? (
                          <video src={getMediaUrl(content.image)} controls className="max-w-full max-h-full rounded-2xl shadow-2xl" />
                      ) : (
                          <img src={getMediaUrl(content.image)} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="" />
                      )}
                  </div>
              ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-center text-slate-100 mb-8">
                          {content.type === 'event' ? <Calendar size={48} /> : content.type === 'recruitment' ? <Briefcase size={48} /> : content.type === 'rent' ? <Store size={48} /> : <Tag size={48} />}
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase">{content.title || "Transmission"}</h2>
                      <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md italic">"{content.content}"</p>
                  </div>
              )}

              {/* Close Button Mobile */}
              <button onClick={onClose} className="md:hidden absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-900 z-10">
                  <X size={20} strokeWidth={3} />
              </button>
          </div>

          {/* RIGHT: INFO & COMMS */}
          <div className="flex-1 h-[60%] md:h-full flex flex-col bg-white/80 backdrop-blur-xl relative">
              
              {/* Header */}
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <Link 
                    to={`/user/${content.author_id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 group/author"
                  >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm bg-slate-100 group-hover/author:border-indigo-500 transition-all">
                          <img src={getMediaUrl(content.author?.avatar, "avatar", content.author?.username)} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover/author:text-indigo-600 transition-colors">{content.author?.name}</h4>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              <Clock size={10} /> {new Date(content.created_at).toLocaleDateString()}
                          </div>
                      </div>
                  </Link>
                  <div className="flex items-center gap-2">
                      {user?._id === content.author_id && (
                        <>
                          <button 
                            onClick={() => setIsEditing(!isEditing)} 
                            className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-indigo-600 transition-all"
                            title="Edit Node"
                          >
                            <Zap size={20} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => onDelete && onDelete(content._id)} 
                            className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-rose-600 transition-all"
                            title="Purge Node"
                          >
                            <Trash2 size={20} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                      <button onClick={onClose} className="hidden md:flex p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 transition-all">
                          <X size={24} strokeWidth={2.5} />
                      </button>
                  </div>
              </div>

              {/* Scrollable Context */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                  {isEditing ? (
                    <div className="mb-10 space-y-4">
                      <textarea 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleEdit} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    (content.image || content.content) && (
                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">{content.title}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">{content.content}</p>
                        </div>
                    )
                  )}

                  {/* Metadata Grid */}
                  {(content.location || content.price || content.category) && (
                      <div className="grid grid-cols-2 gap-4 mb-10">
                          {content.location && (
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                                  <MapPin size={16} className="text-indigo-500" />
                                  <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Node Location</p>
                                      <p className="text-[10px] font-black text-slate-900">{content.location}</p>
                                  </div>
                              </div>
                          )}
                          {content.price && (
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                                  <Zap size={16} className="text-amber-500" />
                                  <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Cost</p>
                                      <p className="text-[10px] font-black text-slate-900">₹{content.price}</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Action CTA for non-standard posts */}
                  {['event', 'recruitment', 'rent'].includes(content.type) && (
                    <div className="flex flex-col gap-3 mb-10">
                        {user?._id === content.author_id ? (
                            <button 
                                onClick={() => setShowApplicants(true)}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                            >
                                <ShieldCheck size={16} strokeWidth={3} /> View Applicants
                            </button>
                        ) : (
                            <button 
                                onClick={handleApply}
                                disabled={isApplying}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {isApplying ? "SYNCING..." : (
                                    content.type === 'event' ? "Register for Node" : 
                                    content.type === 'recruitment' ? "Initiate Application" : "Contact Artifact Owner"
                                )}
                                <ArrowRight size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <MessageCircle size={12} strokeWidth={3} /> Signal History
                      </h5>
                      
                      {content.comments?.length > 0 ? (
                          content.comments.map(c => (
                              <div key={c._id} className="flex gap-4 group/comment">
                                  <Link to={`/user/${c.user?._id}`} onClick={onClose} className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0 bg-slate-50 hover:ring-2 hover:ring-indigo-500 transition-all">
                                      <img src={getMediaUrl(c.user?.avatar, "avatar", c.user?.username)} className="w-full h-full object-cover" alt="" />
                                  </Link>
                                  <div className="flex-1 bg-slate-50 p-4 rounded-[1.5rem] rounded-tl-none border border-slate-100">
                                      <div className="flex justify-between items-center mb-1">
                                          <Link to={`/user/${c.user?._id}`} onClick={onClose} className="text-[10px] font-black text-slate-900 uppercase hover:text-indigo-600 transition-colors">{c.user?.name}</Link>
                                          <span className="text-[7px] font-bold text-slate-300 uppercase">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="py-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest italic">
                              Zero communication signals detected.
                          </div>
                      )}
                  </div>
              </div>

              {/* Input Overlay */}
              <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <div className="flex items-center gap-6 mb-6 px-2">
                      <button onClick={handleLike} className="flex items-center gap-2 group transition-all">
                          <Heart size={20} className={`${content.likes?.includes(user?._id) ? "text-rose-500 fill-rose-500" : "text-slate-300 group-hover:text-rose-500"}`} />
                          <span className="text-[10px] font-black text-slate-400">{content.likes?.length || 0} Nodes</span>
                      </button>
                      <div className="flex items-center gap-2 text-slate-300">
                          <MessageCircle size={20} />
                          <span className="text-[10px] font-black text-slate-400">{content.comments?.length || 0} Signals</span>
                      </div>
                      <button className="ml-auto text-slate-200 hover:text-indigo-500 transition-colors">
                          <Share2 size={18} />
                      </button>
                  </div>

                  <form onSubmit={handleComment} className="flex gap-3">
                      <input 
                          value={newComment}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Encode a signal..."
                          className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                      />
                      <button 
                          type="submit"
                          disabled={!newComment.trim()}
                          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 shrink-0"
                      >
                          <Send size={18} strokeWidth={2.5} />
                      </button>
                  </form>
              </div>

          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showApplicants && (
            <ApplicantsModal postId={content._id} onClose={() => setShowApplicants(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ApplicantsModal({ postId, onClose }) {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/posts/${postId}/applicants`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplicants(res.data);
            } catch (err) {
                toast.error("Failed to decode applicant nodes.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, [postId, token]);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
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
                className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[70vh]"
            >
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Applicant Nodes</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing...</p>
                        </div>
                    ) : applicants.length === 0 ? (
                        <div className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                            No nodes registered
                        </div>
                    ) : (
                        applicants.map(app => (
                            <div key={app._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <img src={getMediaUrl(app.user?.avatar, "avatar", app.user?.username)} className="w-10 h-10 rounded-xl object-cover" />
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900">{app.user?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 tracking-tight">{app.user?.email}</p>
                                </div>
                                <Link 
                                    to={`/chat?userId=${app.user?._id}`}
                                    className="p-3 bg-white text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                    <MessageSquare size={16} />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
