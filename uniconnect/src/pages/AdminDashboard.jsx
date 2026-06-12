import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Users, 
  FileText, 
  Trash2, 
  ShieldAlert, 
  LogOut, 
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  AlertTriangle,
  Check,
  ShieldCheck,
  LayoutGrid,
  ChevronRight,
  Clock,
  ExternalLink,
  GraduationCap,
  Send,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE_URL from "../api";
import { useNavigate } from "react-router-dom";
import { getMediaUrl } from "../utils/media";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [fetchingUserPosts, setFetchingUserPosts] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const showStatus = useCallback((type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (activeTab === "users") endpoint = "/users/all";
      else if (activeTab === "reports") endpoint = "/reports";
      else if (activeTab === "colleges") endpoint = "/colleges";
      else if (activeTab === "announcements") endpoint = "/notifications/all"; 

      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (activeTab === "users") setUsers(res.data);
      else if (activeTab === "reports") setReports(res.data);
      else if (activeTab === "colleges") setColleges(res.data);
      else if (activeTab === "announcements") setAnnouncements(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate("/");
        return;
      }
      showStatus("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, showStatus, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchData();
  }, [token, navigate, fetchData]);

  const handleAddCollege = async (e) => {
    e.preventDefault();
    if (!newCollegeName.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/colleges`, { name: newCollegeName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColleges([...colleges, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCollegeName("");
      showStatus("success", "College added successfully");
    } catch (_err) {
      showStatus("error", _err.response?.data?.error || "Failed to add college");
    }
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm("Delete this college? All associated user links may break.")) return;
    try {
      await axios.delete(`${API_BASE_URL}/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColleges(colleges.filter(c => c._id !== id));
      showStatus("success", "College deleted");
    } catch (_err) {
      showStatus("error", "Purge Operation Terminated");
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await axios.put(`${API_BASE_URL}/reports/${reportId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(reports.filter(r => r._id !== reportId));
      showStatus("success", "Report resolved");
    } catch (_err) {
      showStatus("error", "Failed to resolve report");
    }
  };

  const handleDeleteReportedPost = async (postId, reportId) => {
    if (!window.confirm("Delete this reported post?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.put(`${API_BASE_URL}/reports/${reportId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(reports.filter(r => r._id !== reportId));
      showStatus("success", "Post deleted and report resolved");
    } catch (_err) {
      showStatus("error", "Purge Operation Terminated");
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/notifications/announcement`, { text: announcementText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncementText("");
      showStatus("success", "Announcement sent successfully");
      // Optional: refresh history if needed
    } catch (_err) {
      showStatus("error", "Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Permanently delete this ${activeTab === 'users' ? 'user' : 'report'}?`)) return;

    try {
      const endpoint = activeTab === "users" ? `/users/${id}` : `/reports/${id}`;
      await axios.delete(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showStatus("success", "Entry deleted");
      fetchData(); 
    } catch (_err) {
      showStatus("error", "Failed to delete entry");
    }
  };

  const handleToggleBan = async (id) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/users/${id}/ban`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showStatus("success", res.data.message);
      
      // Update local state
      setUsers(prev => prev.map(u => u._id === id ? { ...u, is_banned: res.data.isBanned } : u));
      if (selectedUser?._id === id) {
        setSelectedUser(prev => ({ ...prev, is_banned: res.data.isBanned }));
      }
    } catch (_err) {
      showStatus("error", "Failed to update user status");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setFetchingUserPosts(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/posts/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPosts(res.data);
    } catch (_err) {
      showStatus("error", "Failed to load user data");
    } finally {
      setFetchingUserPosts(false);
    }
  };


  const filteredData = activeTab === "users" 
    ? users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    : activeTab === "reports"
    ? reports.filter(r => 
        r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.reporter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.post && (r.post.content || r.post.title)?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : activeTab === "colleges"
    ? colleges.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : announcements.filter(a => a.text?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0c0f1a] text-slate-900 dark:text-slate-100 font-sans flex flex-col bg-mesh">
      {/* HEADER */}
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-200">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">UniConnect <span className="text-indigo-600">Admin</span></h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
                  <ShieldCheck size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Admin Access</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-black text-[10px] tracking-widest uppercase shadow-xl shadow-slate-200 dark:shadow-slate-900/50"
              >
                <LogOut size={14} strokeWidth={3} /> Logout
              </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12 lg:p-16">
        
        {/* Stats row for small/medium screens (hidden on lg+) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 lg:hidden">
            <CompactStatBox label="Total Users" value={users.length} icon={Users} color="indigo" />
            <CompactStatBox label="Colleges" value={colleges.length} icon={GraduationCap} color="emerald" />
            <CompactStatBox label="Pending Reports" value={reports.length} icon={AlertTriangle} color="rose" />
            <CompactStatBox label="Status" value="Online" icon={LayoutGrid} color="sky" />
        </div>

        <div className="flex gap-8 items-start">
        
        {/* LEFT — Main Content */}
        <div className="flex-1 min-w-0">

        {/* TABS & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900 w-fit overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'users' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              <Users size={16} strokeWidth={3} /> Users
            </button>
            <button 
              onClick={() => setActiveTab("colleges")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'colleges' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              <GraduationCap size={16} strokeWidth={3} /> Colleges
            </button>
            <button 
              onClick={() => setActiveTab("announcements")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'announcements' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              <Sparkles size={16} strokeWidth={3} /> Announcements
            </button>
            <button 
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'reports' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              <AlertTriangle size={16} strokeWidth={3} /> Reports
            </button>
          </div>

          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 w-full transition-all shadow-sm dark:shadow-slate-900 font-bold text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        {/* STATUS BAR */}
        <AnimatePresence>
          {statusMessage.text && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex items-center gap-3 p-5 rounded-2xl mb-8 font-black text-xs uppercase tracking-widest shadow-xl ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-50 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'}`}
            >
              {statusMessage.type === 'success' ? <CheckCircle size={20} strokeWidth={3} /> : <AlertCircle size={20} strokeWidth={3} />}
              {statusMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* COLLEGE CREATION FORM */}
        <AnimatePresence>
          {activeTab === "colleges" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAddCollege} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900 mb-10 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">University Name</label>
                  <input
                    type="text"
                    value={newCollegeName}
                    onChange={(e) => setNewCollegeName(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm font-bold text-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-slate-200 dark:shadow-slate-900/50 shrink-0"
                >
                  Add College
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ANNOUNCEMENT BROADCAST FORM */}
        <AnimatePresence>
          {activeTab === "announcements" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSendAnnouncement} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900 mb-10 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Announcement Message</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter announcement text..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm font-bold text-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-indigo-900/30 shrink-0 flex items-center gap-2"
                >
                  <Send size={14} strokeWidth={3} /> Send
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DATA TABLE */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[3rem] border border-white dark:border-slate-700 shadow-[0_40px_100px_rgba(0,0,0,0.03)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-6 text-slate-300">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-100 dark:shadow-indigo-900/30" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-500">Loading data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-32 text-center text-slate-300 dark:text-slate-500 uppercase text-[10px] font-black tracking-[0.4em]">
              No results found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                    <th className="px-10 py-6">
                      {activeTab === 'users' ? 'User' : activeTab === 'reports' ? 'Reported Content' : activeTab === 'colleges' ? 'College' : 'Announcement'}
                    </th>
                    <th className="px-10 py-6">
                      {activeTab === 'users' ? 'Role' : activeTab === 'reports' ? 'Reporter / Reason' : activeTab === 'colleges' ? 'ID' : 'Sent To'}
                    </th>
                    <th className="px-10 py-6">
                      {activeTab === 'users' ? 'Joined' : activeTab === 'reports' ? 'Reported At' : activeTab === 'colleges' ? 'Created' : 'Sent At'}
                    </th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {activeTab === "users" && filteredData.map((item) => (
                      <tr key={item._id} className="hover:bg-indigo-500/[0.01] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <img src={getMediaUrl(item.avatar, "avatar", item.username)} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{item.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">@{item.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${item.role === 'admin' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 dark:shadow-slate-900' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800'}`}>
                              {item.role}
                            </span>
                            {item.is_banned && (
                              <span className="text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-rose-500 text-white shadow-lg shadow-rose-200">
                                Banned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => handleViewUser(item)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                            >
                              <Eye size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => handleToggleBan(item._id)}
                              title={item.is_banned ? "Restore User" : "Suspend User"}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border border-transparent hover:shadow-lg ${item.is_banned ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-100 dark:hover:border-emerald-800" : "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-100 dark:hover:border-amber-800"}`}
                            >
                              <ShieldAlert size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800"
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  
                  {activeTab === "reports" && filteredData.map((report) => (
                      <tr key={report._id} className="hover:bg-rose-500/[0.01] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="max-w-md">
                            <div className="flex items-center gap-4">
                                {report.post?.image && <img src={getMediaUrl(report.post.image)} className="w-10 h-10 rounded-lg object-cover" />}
                                <div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-bold line-clamp-2 leading-relaxed">
                                      {report.post ? (report.post.content || report.post.title) : "Post deleted"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                          Author: {report.post?.author?.name || "Deleted User"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="text-[10px]">
                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Reporter: {report.reporter?.name}</p>
                            <p className="text-rose-500 dark:text-rose-400 font-bold uppercase mt-1 tracking-widest bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md w-fit">Reason: {report.reason}</p>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              title="Resolve Report"
                              onClick={() => handleResolveReport(report._id)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
                            >
                              <Check size={20} strokeWidth={3} />
                            </button>
                            {report.post && (
                              <button 
                                title="Delete Post"
                                onClick={() => handleDeleteReportedPost(report.post._id, report._id)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800"
                              >
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "colleges" && filteredData.map((college) => (
                      <tr key={college._id} className="hover:bg-emerald-500/[0.01] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm group-hover:rotate-12 transition-transform duration-500">
                                <GraduationCap size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{college.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <code className="text-[10px] font-bold text-slate-300 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md tracking-tighter">
                            {college._id}
                          </code>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {new Date(college.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => handleDeleteCollege(college._id)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800"
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "announcements" && filteredData.map((announcement) => (
                      <tr key={announcement._id} className="hover:bg-indigo-500/[0.01] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <Sparkles size={22} strokeWidth={2.5} />
                            </div>
                            <div className="max-w-md">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed italic">"{announcement.text}"</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Announcement</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                             <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">All Users</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {new Date(announcement.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3">
                             <button className="w-10 h-10 flex items-center justify-center text-slate-200 dark:text-slate-600 cursor-not-allowed">
                               <ShieldCheck size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
        
        {/* RIGHT — Stats Sidebar */}
        <div className="w-64 shrink-0 hidden lg:block space-y-3">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1">Overview</div>
            <CompactStatBox label="Total Users" value={users.length} icon={Users} color="indigo" />
            <CompactStatBox label="Colleges" value={colleges.length} icon={GraduationCap} color="emerald" />
            <CompactStatBox label="Pending Reports" value={reports.length} icon={AlertTriangle} color="rose" />
            <CompactStatBox label="Status" value="Online" icon={LayoutGrid} color="sky" />
        </div>
        </div>
      </main>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/10 dark:bg-black/60"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative bg-white dark:bg-slate-900 border border-white dark:border-slate-700 w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_150px_rgba(0,0,0,0.4)] flex flex-col md:flex-row max-h-[85vh] bg-mesh"
            >
                <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800 p-12 flex flex-col items-center border-r border-slate-100 dark:border-slate-700">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl border border-slate-100 mb-8">
                        <img src={getMediaUrl(selectedUser.avatar, "avatar", selectedUser.username)} className="w-full h-full object-cover rounded-[2.2rem]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center tracking-tight mb-2">{selectedUser.name}</h2>
                    <p className="text-xs font-bold text-slate-400 mb-10">@{selectedUser.username}</p>
                    
                    <div className="w-full space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</span>
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{selectedUser.role}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${selectedUser.is_banned ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                <span className={`text-[10px] font-black ${selectedUser.is_banned ? 'text-rose-600' : 'text-emerald-600'} uppercase tracking-widest`}>
                                  {selectedUser.is_banned ? 'Banned' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-3 mt-10">
                        <button 
                            onClick={() => handleToggleBan(selectedUser._id)}
                            className={`w-full py-5 rounded-[1.5rem] border font-black text-[10px] tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${selectedUser.is_banned ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 shadow-emerald-100/50 hover:bg-emerald-600 hover:text-white' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800 shadow-amber-100/50 hover:bg-amber-600 hover:text-white'}`}
                        >
                            <ShieldAlert size={16} strokeWidth={3} /> {selectedUser.is_banned ? 'Restore User' : 'Suspend User'}
                        </button>
                        <button 
                            onClick={() => { if(window.confirm('Delete this user?')) handleDelete(selectedUser._id); }}
                            className="w-full py-5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-[1.5rem] border border-rose-100 dark:border-rose-800 font-black text-[10px] tracking-widest uppercase hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100/50 dark:shadow-rose-900/30 flex items-center justify-center gap-3"
                        >
                            <Trash2 size={16} strokeWidth={3} /> Delete User
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-10 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white/40 dark:bg-slate-800/40">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><FileText size={18} strokeWidth={2.5} /></div>
                             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">User Posts</h3>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        {fetchingUserPosts ? (
                             <div className="py-20 flex flex-col items-center justify-center gap-6 text-slate-200">
                                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-500">Loading posts...</p>
                            </div>
                        ) : userPosts.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <FileText size={40} className="text-slate-100" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No posts found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {userPosts.map(post => (
                                    <div key={post._id} className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-500 flex justify-between items-center group/post">
                                        <div className="flex-1 min-w-0 flex items-center gap-4">
                                            {post.image && <img src={getMediaUrl(post.image)} className="w-12 h-12 rounded-lg object-cover" />}
                                            <div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed mb-3">"{post.content || post.title}"</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-600">{post.type}</span>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                        <Clock size={10} /> {new Date(post.created_at || post.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-12 h-12 flex items-center justify-center text-slate-200 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-2xl transition-all ml-4 opacity-0 group-hover/post:opacity-100">
                                            <Trash2 size={20} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompactStatBox({ label, value, icon: Icon, color }) {
    const colors = {
        indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
        rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800",
        emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
        sky: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800"
    };
    return (
        <motion.div 
            whileHover={{ x: 4 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900 flex items-center gap-4 cursor-default"
        >
            <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center border shadow-sm shrink-0`}>
                <Icon size={16} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-0.5">{value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
            </div>
        </motion.div>
    );
}
