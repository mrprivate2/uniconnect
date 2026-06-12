import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Lock, Key, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setError("No reset token provided. Please request a new password reset link.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/verify-reset-token`, { token });
        if (res.data.valid) {
          setValid(true);
          setUserName(res.data.name || "User");
        } else {
          setError(res.data.error || "Invalid or expired reset token.");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to verify reset token. It may have expired.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setResetting(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="h-screen w-full flex font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 bg-mesh text-slate-900 dark:text-slate-100 overflow-hidden items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [-50, 50, -50], y: [-20, 20, -20], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-indigo-400/5 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [50, -50, 50], y: [20, -20, 20], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-blue-400/5 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-[0_20px_70px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-700 relative z-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black tracking-tighter uppercase italic">
            Uni<span className="text-indigo-600">Connect</span>
          </span>
        </div>

        {verifying ? (
          <div className="py-16 flex flex-col items-center gap-6">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Verifying reset token...</p>
          </div>
        ) : success ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Password Reset</h2>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        ) : valid ? (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-emerald-100">
                <CheckCircle2 size={10} strokeWidth={3} /> Token Verified
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Reset Password</h2>
              <p className="text-xs text-slate-400 font-medium">
                Hi {userName}, choose a new password for your account.
              </p>
              {emailParam && (
                <p className="text-[10px] text-indigo-600 font-black mt-2 uppercase tracking-widest">
                  {emailParam}
                </p>
              )}
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" strokeWidth={2.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-900 font-bold"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" strokeWidth={2.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-900 font-bold"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 text-xs p-4 rounded-2xl font-bold border border-rose-100 flex items-center gap-3">
                  <AlertCircle size={16} strokeWidth={3} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={resetting || !password || password !== confirmPassword}
                className="w-full py-5 rounded-2xl bg-[#0F172A] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
              >
                {resetting ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Reset Password <ArrowRight size={18} strokeWidth={3} /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Invalid Token</h2>
            <p className="text-sm text-slate-500 font-medium mb-8">{error || "This reset link is invalid or has expired."}</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 rounded-2xl bg-[#0F172A] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
