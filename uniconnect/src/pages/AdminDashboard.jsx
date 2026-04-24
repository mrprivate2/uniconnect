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
      showStatus("error", "Access Denied: Node Synchronization Failure");
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
      showStatus("success", "New University Node Integrated");
    } catch (_err) {
      showStatus("error", _err.response?.data?.error || "Integration Protocol Failed");
    }
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm("IRREVERSIBLE: Purge this university node? All associated user links may break.")) return;
    try {
      await axios.delete(`${API_BASE_URL}/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColleges(colleges.filter(c => c._id !== id));
      showStatus("success", "University Node Purged");
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
      showStatus("success", "Protocol Conflict Resolved");
    } catch (_err) {
      showStatus("error", "Resolution Protocol Failed");
    }
  };

  const handleDeleteReportedPost = async (postId, reportId) => {
    if (!window.confirm("Purge this reported node from the network?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.put(`${API_BASE_URL}/reports/${reportId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(reports.filter(r => r._id !== reportId));
      showStatus("success", "Node Purged and Report Resolved");
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
      showStatus("success", "System-wide Announcement Transmitted");
      // Optional: refresh history if needed
    } catch (_err) {
      showStatus("error", "Transmission Failure: Admin Protocol Required");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Permanently delete this ${activeTab === 'users' ? 'user node' : 'report'}?`)) return;

    try {
      const endpoint = activeTab === "users" ? `/users/${id}` : `/reports/${id}`;
      await axios.delete(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showStatus("success", "Entry Terminated");
      fetchData(); 
    } catch (_err) {
      showStatus("error", "Termination Protocol Failed");
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
      showStatus("error", "Ban Protocol Restricted");
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
      showStatus("error", "Failed to retrieve user node data");
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col bg-mesh">
      {/* HEADER */}
      <header className="border-b border-slate-100 bg-white/60 backdrop-blur-xl sticky top-0 z-50 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-200">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">Protocol <span className="text-indigo-600">Admin</span></h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">System Level Access</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <ShieldCheck size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Root Instance</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-black text-[10px] tracking-widest uppercase shadow-xl shadow-slate-200"
              >
                <LogOut size={14} strokeWidth={3} /> Terminate
              </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12 lg:p-16">
        
        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatBox label="Active Nodes" value={users.length} icon={Users} color="indigo" />
            <StatBox label="University Hubs" value={colleges.length} icon={GraduationCap} color="emerald" />
            <StatBox label="Pending Reports" value={reports.length} icon={AlertTriangle} color="rose" />
            <StatBox label="System Health" value="OPTIMAL" icon={LayoutGrid} color="sky" />
        </div>

        {/* TABS & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'users' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              <Users size={16} strokeWidth={3} /> Verified Nodes
            </button>
            <button 
              onClick={() => setActiveTab("colleges")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'colleges' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              <GraduationCap size={16} strokeWidth={3} /> University Nodes
            </button>
            <button 
              onClick={() => setActiveTab("announcements")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'announcements' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              <Sparkles size={16} strokeWidth={3} /> Broadcast History
            </button>
            <button 
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'reports' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              <AlertTriangle size={16} strokeWidth={3} /> Threat Reports
            </button>
          </div>

          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder={`Filter system ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 w-full transition-all shadow-sm font-bold text-slate-700"
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
              className={`flex items-center gap-3 p-5 rounded-2xl mb-8 font-black text-xs uppercase tracking-widest shadow-xl ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-50' : 'bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-50'}`}
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
              <form onSubmit={handleAddCollege} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">University Name</label>
                  <input
                    type="text"
                    value={newCollegeName}
                    onChange={(e) => setNewCollegeName(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm font-bold text-slate-700"
                  />
                </div>
                <button 
                  type="submit"
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-slate-200 shrink-0"
                >
                  Integrate Node
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
              <form onSubmit={handleSendAnnouncement} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Broadcast Message</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter system-wide transmission text..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm font-bold text-slate-700"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 shrink-0 flex items-center gap-2"
                >
                  <Send size={14} strokeWidth={3} /> Transmit
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DATA TABLE */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-6 text-slate-300">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-100" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Protocol Data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-32 text-center text-slate-300 uppercase text-[10px] font-black tracking-[0.4em]">
              Zero results in current sector
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <th className="px-10 py-6">
                      {activeTab === 'users' ? 'Identity Node' : activeTab === 'reports' ? 'Infected Content' : activeTab === 'colleges' ? 'University Node' : 'Broadcast Content'}
                    </th>
                    <th className="px-10 py-6">
                      {activeTab === 'users' ? 'Authorization' : activeTab === 'reports' ? 'Reporter / Reason' : activeTab === 'colleges' ? 'System ID' : 'Transmitted To'}
                    </th>
                    <th className="px-10 py-6">
                      {activeTab === 'users' ? 'Created' : activeTab === 'reports' ? 'Logged At' : activeTab === 'colleges' ? 'Integrated On' : 'Broadcast At'}
                    </th>
                    <th className="px-10 py-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeTab === "users" && filteredData.map((item) => (
                      <tr key={item._id} className="hover:bg-indigo-500/[0.01] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100 border border-slate-100 overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <img src={getMediaUrl(item.avatar, "avatar", item.username)} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{item.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">@{item.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${item.role === 'admin' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
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
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-indigo-100"
                            >
                              <Eye size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => handleToggleBan(item._id)}
                              title={item.is_banned ? "Restore Node" : "Suspend Node"}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border border-transparent hover:shadow-lg ${item.is_banned ? "text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100" : "text-amber-500 hover:bg-amber-50 hover:border-amber-100"}`}
                            >
                              <ShieldAlert size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-rose-100"
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
                                    <p className="text-sm text-slate-700 font-bold line-clamp-2 leading-relaxed">
                                      {report.post ? (report.post.content || report.post.title) : "Node already purged"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                                          Origin: {report.post?.author?.name || "Terminated User"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="text-[10px]">
                            <p className="font-black text-slate-900 uppercase tracking-tighter">Reporter: {report.reporter?.name}</p>
                            <p className="text-rose-500 font-bold uppercase mt-1 tracking-widest bg-rose-50 px-2 py-0.5 rounded-md w-fit">Flag: {report.reason}</p>
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
                              title="Resolve Protocol"
                              onClick={() => handleResolveReport(report._id)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-emerald-100"
                            >
                              <Check size={20} strokeWidth={3} />
                            </button>
                            {report.post && (
                              <button 
                                title="Purge Node"
                                onClick={() => handleDeleteReportedPost(report.post._id, report._id)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-rose-100"
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
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{college.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Node</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <code className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-md tracking-tighter">
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
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-rose-100"
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
                              <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-relaxed italic">"{announcement.text}"</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">System Broadcast</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Network</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {new Date(announcement.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3">
                             <button className="w-10 h-10 flex items-center justify-center text-slate-200 cursor-not-allowed">
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
      </main>

      {/* NODE PROFILE MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/10"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative bg-white border border-white w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.15)] flex flex-col md:flex-row max-h-[85vh] bg-mesh"
            >
                <div className="w-full md:w-1/3 bg-slate-50 p-12 flex flex-col items-center border-r border-slate-100">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl border border-slate-100 mb-8">
                        <img src={getMediaUrl(selectedUser.avatar, "avatar", selectedUser.username)} className="w-full h-full object-cover rounded-[2.2rem]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight mb-2">{selectedUser.name}</h2>
                    <p className="text-xs font-bold text-slate-400 mb-10">@{selectedUser.username}</p>
                    
                    <div className="w-full space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Level</span>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedUser.role}</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${selectedUser.is_banned ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                <span className={`text-[10px] font-black ${selectedUser.is_banned ? 'text-rose-600' : 'text-emerald-600'} uppercase tracking-widest`}>
                                  {selectedUser.is_banned ? 'Suspended' : 'Online'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-3 mt-10">
                        <button 
                            onClick={() => handleToggleBan(selectedUser._id)}
                            className={`w-full py-5 rounded-[1.5rem] border font-black text-[10px] tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${selectedUser.is_banned ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50 hover:bg-emerald-600 hover:text-white' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50 hover:bg-amber-600 hover:text-white'}`}
                        >
                            <ShieldAlert size={16} strokeWidth={3} /> {selectedUser.is_banned ? 'Restore Node' : 'Suspend Node'}
                        </button>
                        <button 
                            onClick={() => { if(window.confirm('IRREVERSIBLE: Terminate this user node?')) handleDelete(selectedUser._id); }}
                            className="w-full py-5 bg-rose-50 text-rose-600 rounded-[1.5rem] border border-rose-100 font-black text-[10px] tracking-widest uppercase hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100/50 flex items-center justify-center gap-3"
                        >
                            <Trash2 size={16} strokeWidth={3} /> Terminate Node
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white/40">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><FileText size={18} strokeWidth={2.5} /></div>
                             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Node History</h3>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        {fetchingUserPosts ? (
                             <div className="py-20 flex flex-col items-center justify-center gap-6 text-slate-200">
                                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Decoding Posts...</p>
                            </div>
                        ) : userPosts.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <FileText size={40} className="text-slate-100" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No node history detected</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {userPosts.map(post => (
                                    <div key={post._id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 flex justify-between items-center group/post">
                                        <div className="flex-1 min-w-0 flex items-center gap-4">
                                            {post.image && <img src={getMediaUrl(post.image)} className="w-12 h-12 rounded-lg object-cover" />}
                                            <div>
                                                <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed mb-3">"{post.content || post.title}"</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-slate-100">{post.type}</span>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                        <Clock size={10} /> {new Date(post.created_at || post.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-12 h-12 flex items-center justify-center text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all ml-4 opacity-0 group-hover/post:opacity-100">
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

function StatBox({ label, value, icon: Icon, color }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        sky: "bg-sky-50 text-sky-600 border-sky-100"
    };
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6"
        >
            <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center border shadow-sm`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </motion.div>
    );
}
