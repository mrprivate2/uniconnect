import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, User, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../api";
import { generateKeyPair } from "../utils/crypto";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStatusMessage("");

    if (isForgot) {
      try {
        await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: formData.email });
        setStatusMessage("Reset link transmitted to authorized email");
        setIsForgot(false);
        setIsLogin(true);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.error || "Protocol Failure: User node not identified");
      }
      return;
    }
    
    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
      } else {
        // 🔥 Generate E2EE Keys for new user
        const keys = await generateKeyPair();
        
        response = await axios.post(`${API_BASE_URL}/auth/register`, {
          ...formData,
          publicKey: keys.publicKey
        });

        // Store private key locally
        localStorage.setItem(`private_key_${response.data.user._id}`, keys.privateKey);
      }

      const { token, user } = response.data;
      console.log("Logged in user:", user);

      // Ensure we have keys if they exist in DB but not local (for existing users logging in)
      if (isLogin) {
        // In a real app, we might need a way to recover private keys, 
        // but for now we check if we have one, or just alert.
        const existingKey = localStorage.getItem(`private_key_${user._id}`);
        if (!existingKey) {
            console.warn("No private key found on this device. E2EE chat will be restricted.");
        }
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      onLogin(user, !isLogin);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Auth Error Object:", err);
      const errorMessage = err.response?.data?.error || err.message || "Authentication failed. Please check your details.";
      setError(errorMessage);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      _id: "guest",
      name: "Guest User",
      username: "guest",
      role: "user",
      isGuest: true
    };
    localStorage.setItem("user", JSON.stringify(guestUser));
    onLogin(guestUser, false);
    navigate("/select-college");
  };

  return (
    <div className="h-screen w-full flex font-sans selection:bg-indigo-100 bg-mesh text-slate-900 overflow-hidden">
      
      {/* LEFT SIDE - Premium Hero */}
      <div className="hidden lg:flex w-1/2 bg-white sticky top-0 h-full items-center justify-center p-20 overflow-hidden border-r border-slate-100 flex-shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative z-10 max-w-lg">
          <div className="opacity-100 transform-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100">
              <Shield size={12} strokeWidth={3} /> Premium Security Enabled
            </div>
            
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-6">
              The Student<br />
              <span className="text-gradient">Operating System.</span>
            </h1>
            
            <p className="text-slate-500 text-xl font-medium leading-relaxed mb-12">
              Connect with innovators, find your circle, and trade within your campus—all with <span className="text-indigo-600 font-bold underline decoration-indigo-200 decoration-4">End-to-End Encryption</span>.
            </p>

            <div className="grid grid-cols-2 gap-6">
               {[
                 { label: 'E2EE Chat', desc: 'Secure conversations' },
                 { label: 'Marketplace', desc: 'Rent & Trade' },
                 { label: 'Campus Feed', desc: 'Live Updates' },
                 { label: 'Networking', desc: 'Connect with peers' }
               ].map((item) => (
                 <div key={item.label} className="flex gap-3 items-start">
                    <div className="mt-1 bg-indigo-600 rounded-md p-0.5"><CheckCircle2 size={14} className="text-white" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-sky-50 rounded-full blur-3xl opacity-60" />
      </div>

      {/* RIGHT SIDE - Refined Auth Form */}
      <div className="flex-1 h-full flex flex-col items-center justify-start p-8 pt-12 md:pt-24 overflow-y-auto no-scrollbar">
        <motion.div 
          layout
          className="w-full max-w-[440px] bg-white rounded-[3rem] p-10 shadow-[0_20px_70px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          {/* Role & Mode Switcher */}
          <div className="flex flex-col gap-6 mb-10">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setIsAdmin(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${!isAdmin ? "bg-white shadow-md text-indigo-600" : "text-slate-400"}`}
              >
                <User size={14} strokeWidth={3} /> STUDENT
              </button>
              <button 
                onClick={() => {
                  setIsAdmin(true);
                  setIsLogin(true);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${isAdmin ? "bg-white shadow-md text-indigo-600" : "text-slate-400"}`}
              >
                <Shield size={14} strokeWidth={3} /> ADMIN
              </button>
            </div>

            <div className="flex justify-between items-center px-2 min-h-[40px]">
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={isForgot ? "forgot" : (isAdmin ? "admin" : (isLogin ? "login" : "signup"))}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-3xl font-black text-slate-900 tracking-tight"
                  >
                    {isForgot ? "Reset Protocol" : (isAdmin ? "Hello Admin" : (isLogin ? "Welcome back" : "Create account"))}
                  </motion.h2>
                </AnimatePresence>
                <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Lock size={20} strokeWidth={2.5} />
                </div>
            </div>
          </div>

          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 text-emerald-600 text-xs p-4 rounded-2xl mb-6 font-bold border border-emerald-100 flex items-center gap-3"
            >
              <CheckCircle2 size={16} strokeWidth={3} />
              {statusMessage}
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-600 text-xs p-4 rounded-2xl mb-6 font-bold border border-rose-100 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isForgot ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                 <p className="text-xs font-bold text-slate-400 leading-relaxed px-1 text-center">
                    Enter your authorized email address to receive a secure reset synchronization link.
                 </p>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-900 font-bold"
                      placeholder="name@university.edu"
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="w-full py-5 rounded-2xl bg-[#0F172A] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
                  >
                    {loading ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Request Reset Link"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsForgot(false)}
                    className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                    Back to Login
                  </button>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div 
                      key="signup-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4 pb-5">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                          <input
                            name="name"
                            required={!isLogin}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-900 font-bold"
                            placeholder="Sawan Y."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                          <input
                            name="username"
                            required={!isLogin}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-900 font-bold"
                            placeholder="sawanyadav"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email or Username</label>
                  <input
                    name="email"
                    type="text"
                    required
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-900 font-bold"
                    placeholder="name@university.edu or username"
                  />
                </div>

                <div className="relative">
                  <div className="flex justify-between mb-2 ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    {isLogin && <button onClick={() => setIsForgot(true)} type="button" className="text-[10px] text-indigo-600 font-black hover:underline uppercase tracking-widest">Forgot?</button>}
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-900 font-bold"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 bottom-4 text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  disabled={loading}
                  className="w-full py-5 mt-4 rounded-2xl bg-[#0F172A] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <> {isLogin ? "Sign In" : "Create Account"} <ArrowRight size={18} strokeWidth={3} /> </>
                  )}
                </button>
              </>
            )}
          </form>

          <AnimatePresence>
            {!isAdmin && (
              <motion.div
                key="student-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative flex items-center my-10">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="px-4 text-[10px] text-slate-300 font-black tracking-[0.3em]">OR</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <button 
                  onClick={handleGuestLogin}
                  className="w-full py-4 rounded-2xl border-2 border-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                >
                  Explore as Guest
                </button>

                <p className="text-center mt-10 text-[11px] font-bold text-slate-400">
                    {isLogin ? "New to UniConnect?" : "Already have an account?"}{" "}
                    <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-indigo-600 hover:underline uppercase tracking-widest ml-1"
                    >
                    {isLogin ? "Create account" : "Log in"}
                    </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-rose-400 transition-colors"
            >
              Emergency: Reset Local Session
            </button>
          </div>
        </motion.div>
        
        <footer className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          End-to-End Encrypted Environment
        </footer>
      </div>
    </div>
  );
}
