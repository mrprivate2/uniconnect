import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Lock, Globe, LogOut, Shield, CheckCircle, ShieldCheck, Key, Activity, Cpu, Database, Clock } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";

// 🛠️ HARDWARE CIRCUITRY ANIMATION
const Circuitry = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.03]">
        <svg width="100%" height="100%">
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0 50 H30 L50 20 H100 M50 20 V0 M30 50 L10 80 H0" stroke="currentColor" strokeWidth="1" fill="none" className="text-blue-600" />
                <circle cx="50" cy="20" r="2" fill="currentColor" />
                <circle cx="30" cy="50" r="2" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
        <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent"
        />
    </div>
);

// 🎯 Stagger Variants
const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: "spring", stiffness: 220, damping: 22, mass: 0.8 },
    },
};

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
  }, [user]);

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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shrink-0 ${
        enabled ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
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
    <div className="min-h-screen pb-40 font-sans bg-mesh text-slate-900 dark:text-slate-100 relative overflow-hidden selection:bg-blue-100 dark:selection:bg-blue-900/50">
      <Circuitry />
      <div className="max-w-[1200px] mx-auto p-6 md:p-10 lg:p-16 lg:pt-4 relative z-10">
        
        {/* HEADER SECTION */}
        <motion.header 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100">
                <ShieldCheck size={10} strokeWidth={3} /> Verified Security Instance
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
              System<span className="text-indigo-600">.</span>Config
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Environment Node ID: <span className="text-slate-600">{user._id || "Scanning..."}</span></p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-xl shadow-slate-200 dark:shadow-slate-900 disabled:opacity-50 flex items-center gap-3 self-start md:self-auto"
          >
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : "COMMIT CHANGES"}
          </motion.button>
        </motion.header>

        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg ${
                saveStatus.includes("Error") ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}
            >
              <CheckCircle size={14} strokeWidth={3} />
              {saveStatus}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SETTINGS ARCHITECTURE */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            
            {/* SIDE NAVIGATION */}
            <nav className="w-full lg:w-64 flex flex-row lg:flex-col gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
                {tabs.map((tab, i) => (
                    <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-lg shadow-slate-200/50 dark:shadow-slate-900 border border-slate-100 dark:border-slate-700" 
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                        }`}
                    >
                        <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        {tab.label}
                    </motion.button>
                ))}
                
                <div className="hidden lg:block h-px bg-slate-100 my-3 mx-3" />
                <div className="lg:hidden w-px h-6 bg-slate-100 mx-1" />
                
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all whitespace-nowrap"
                >
                    <LogOut size={16} />
                    Terminate Node
                </button>
            </nav>

            {/* MAIN CONFIGURATION PANEL */}
            <div className="flex-1 w-full min-w-0">
                <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                        <motion.section
                            key="profile"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-8 lg:p-12 border border-white shadow-[0_40px_100px_rgba(0,0,0,0.02)]"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100">
                                    <User size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Identity Encoding</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Configure your public node profile</p>
                                </div>
                            </div>

                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-6"
                            >
                                <motion.div variants={cardVariants}>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Broadcast Name</label>
                                    <input
                                        type="text"
                                        placeholder="Identification Name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm text-slate-900 font-bold"
                                    />
                                </motion.div>
                                <motion.div variants={cardVariants}>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Node Description (Bio)</label>
                                    <textarea
                                        placeholder="Sync your trajectory with others..."
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none text-sm text-slate-900 font-bold min-h-[120px] resize-none leading-relaxed"
                                    />
                                </motion.div>
                            </motion.div>
                        </motion.section>
                    )}

                    {activeTab === "privacy" && (
                        <motion.section
                            key="privacy"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[2.5rem] p-8 lg:p-12 border border-white dark:border-slate-700 shadow-[0_40px_100px_rgba(0,0,0,0.02)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-sky-50 dark:bg-sky-900/30 rounded-2xl text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
                                    <Shield size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Security Protocols</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manage node visibility and isolation</p>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
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
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                            <Key size={16} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">E2EE Private Key</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stored in local hardware vault</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-widest shadow-sm">Reveal</button>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {activeTab === "system" && (
                        <motion.section
                            key="system"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[2.5rem] p-8 lg:p-12 border border-white dark:border-slate-700 shadow-[0_40px_100px_rgba(0,0,0,0.02)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                                    <Activity size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">System Node Status</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time environment diagnostics</p>
                                </div>
                            </div>

                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                            >
                                <motion.div variants={cardVariants}><SystemNode label="Protocol Version" value="v1.4.2-stable" icon={Cpu} /></motion.div>
                                <motion.div variants={cardVariants}><SystemNode label="Database Sync" value="Synchronized" icon={Database} success /></motion.div>
                                <motion.div variants={cardVariants}><SystemNode label="Hardware Acceleration" value="Active" icon={Activity} success /></motion.div>
                                <motion.div variants={cardVariants}><SystemNode label="Session Duration" value="04:22:15" icon={Clock} /></motion.div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-8 bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Instance Health</h4>
                                <div className="flex items-end gap-1 h-10">
                                    {[30, 45, 60, 25, 80, 55, 90, 40, 70, 50, 85, 35].map((h, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                            className="flex-1 bg-white/20 rounded-full w-1" 
                                        />
                                    ))}
                                </div>
                                <p className="mt-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={10} className="text-emerald-400" /> All systems operational. Encrypted link stable.
                                </p>
                            </motion.div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </div>

        <footer className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.5em]">
                <Globe size={10} strokeWidth={3} /> UniConnect Network Node © 2026
            </div>
        </footer>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, toggle }) {
    return (
        <div className="flex justify-between items-center py-5 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 px-4 -mx-4 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[13px] font-black text-slate-900 tracking-tight">{title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
                </div>
            </div>
            {toggle}
        </div>
    );
}

function SystemNode({ label, value, icon: Icon, success }) {
    return (
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <div className="flex items-center gap-2">
                    {success && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    <p className="text-sm font-black text-slate-900 tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
}
