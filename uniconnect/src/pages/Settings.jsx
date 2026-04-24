import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Lock, Globe, LogOut, ChevronRight, Shield, CheckCircle, ShieldCheck, Key, Eye, Command, Activity, Cpu, Database, Clock } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isOnlineVisible, setIsOnlineVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user) {
        setProfile({ name: user.name, bio: user.bio || "" });
    }
  }, []);

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/users/profile`, {
        name: profile.name,
        bio: profile.bio,
        isPrivate: isPrivate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSaveStatus("Node Configuration Updated");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("Transmission Error");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Terminate secure node session?")) return;
    localStorage.clear();
    window.location.replace("/");
  };

  const Toggle = ({ enabled, setEnabled }) => (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 focus:outline-none ${
        enabled ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
          enabled ? "translate-x-5.5" : "translate-x-1"
        }`}
      />
    </button>
  );

  const tabs = [
    { id: "profile", label: "Identity Node", icon: User },
    { id: "privacy", label: "Security & Privacy", icon: Shield },
    { id: "system", label: "Network Info", icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40 font-sans bg-mesh text-slate-900">
      
      <div className="max-w-[1200px] mx-auto p-8 md:p-16 lg:pt-24">
        
        {/* HEADER SECTION */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100">
                <ShieldCheck size={12} strokeWidth={3} /> Verified Security Instance
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">
              System<span className="text-indigo-600">.</span>Config
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Environment Node ID: <span className="text-slate-900">{user._id || "Scanning..."}</span></p>
          </div>
          
          <div className="flex gap-4">
             <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-3 active:scale-95"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : "COMMIT CHANGES"}
              </button>
          </div>
        </header>

        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className={`mb-10 p-5 rounded-2xl flex items-center gap-4 font-black text-[10px] uppercase tracking-widest shadow-lg ${
                saveStatus.includes("Error") ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}
            >
              <CheckCircle size={16} strokeWidth={3} />
              {saveStatus}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SETTINGS ARCHITECTURE */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* SIDE NAVIGATION */}
            <nav className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? "bg-white text-indigo-600 shadow-xl shadow-slate-200/50 border border-slate-100" 
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                        }`}
                    >
                        <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        {tab.label}
                    </button>
                ))}
                
                <div className="h-px bg-slate-100 my-6 mx-4" />
                
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                    <LogOut size={18} />
                    Terminate Node
                </button>
            </nav>

            {/* MAIN CONFIGURATION PANEL */}
            <div className="flex-1 w-full min-w-0">
                <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                        <motion.section
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-14 border border-white shadow-[0_40px_100px_rgba(0,0,0,0.02)] group"
                        >
                            <div className="flex items-center gap-4 mb-12">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100 group-hover:rotate-12 transition-transform duration-500">
                                    <User size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity Encoding</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Configure your public node profile</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Broadcast Name</label>
                                    <input
                                        type="text"
                                        placeholder="Identification Name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full px-8 py-5 rounded-[1.8rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm text-slate-900 font-bold shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Node Description (Bio)</label>
                                    <textarea
                                        placeholder="Sync your trajectory with others..."
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        className="w-full px-8 py-5 rounded-[1.8rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm text-slate-900 font-bold min-h-[140px] resize-none shadow-sm font-medium leading-relaxed"
                                    />
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {activeTab === "privacy" && (
                        <motion.section
                            key="privacy"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-14 border border-white shadow-[0_40px_100px_rgba(0,0,0,0.02)] space-y-2 group"
                        >
                            <div className="flex items-center gap-4 mb-12">
                                <div className="p-3 bg-sky-50 rounded-2xl text-sky-600 shadow-sm border border-sky-100 group-hover:rotate-12 transition-transform duration-500">
                                    <Shield size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Protocols</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manage node visibility and isolation</p>
                                </div>
                            </div>
                            
                            <SettingRow 
                                icon={Bell} 
                                title="Neural Notifications" 
                                desc="Push alerts for high-priority transmissions" 
                                toggle={<Toggle enabled={notifications} setEnabled={setNotifications} />}
                            />
                            
                            <SettingRow 
                                icon={Lock} 
                                title="Node Isolation" 
                                desc="Restrict your environment to authorized peers only" 
                                toggle={<Toggle enabled={isPrivate} setEnabled={setIsPrivate} />}
                            />

                            <SettingRow 
                                icon={Globe} 
                                title="Network Beacon" 
                                desc="Broadcast active presence to regional nodes" 
                                toggle={<Toggle enabled={isOnlineVisible} setEnabled={setIsOnlineVisible} />}
                            />

                            <div className="mt-12 pt-10 border-t border-slate-100">
                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                                            <Key size={18} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">E2EE Private Key</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stored in local hardware vault</p>
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-widest shadow-sm active:scale-95">Reveal Protocol</button>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {activeTab === "system" && (
                        <motion.section
                            key="system"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-14 border border-white shadow-[0_40px_100px_rgba(0,0,0,0.02)] group"
                        >
                            <div className="flex items-center gap-4 mb-12">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100 group-hover:rotate-12 transition-transform duration-500">
                                    <Activity size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">System Node Status</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time environment diagnostics</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SystemNode label="Protocol Version" value="v1.4.2-stable" icon={Command} />
                                <SystemNode label="Database Sync" value="Synchronized" icon={Database} success />
                                <SystemNode label="Hardware Acceleration" value="Active" icon={Cpu} success />
                                <SystemNode label="Session Duration" value="04:22:15" icon={Clock} />
                            </div>
                            
                            <div className="mt-12 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Instance Health</h4>
                                <div className="flex items-end gap-1 h-12">
                                    {[30, 45, 60, 25, 80, 55, 90, 40, 70, 50, 85, 35].map((h, i) => (
                                        <div key={i} className="flex-1 bg-white/20 rounded-full w-1" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <p className="mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={10} className="text-emerald-400" /> All systems operational. Encrypted link stable.
                                </p>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </div>

        <footer className="mt-24 text-center">
            <div className="inline-flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
                <Globe size={12} strokeWidth={3} /> UniConnect Network Node © 2026
            </div>
        </footer>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, toggle }) {
    return (
        <div className="flex justify-between items-center py-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-4 -mx-4 rounded-xl transition-colors">
            <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[14px] font-black text-slate-900 tracking-tight">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
            </div>
            </div>
            {toggle}
        </div>
    );
}

function SystemNode({ label, value, icon: Icon, success }) {
    return (
        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    {success && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    <p className="text-sm font-black text-slate-900 tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
}
