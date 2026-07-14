import React, { useState, useEffect } from "react";
import { checkAdminSetup, setupAdminPassword, verifyAdminPassword } from "../dbService";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const result = await checkAdminSetup();
      setIsSetup(result.isSetup);
    }
    init();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 4) {
      setError("密碼長度至少需要 4 位字元！");
      return;
    }
    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致！");
      return;
    }

    setLoading(true);
    try {
      await setupAdminPassword(password);
      setIsSetup(true);
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError("設定密碼時發生錯誤，請重試！");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password) {
      setError("請輸入密碼！");
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        onLoginSuccess();
      } else {
        setError("密碼輸入錯誤，請確認後再試！");
      }
    } catch (err) {
      console.error(err);
      setError("驗證時發生錯誤，請重試！");
    } finally {
      setLoading(false);
    }
  };

  if (isSetup === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <RefreshCw size={24} className="animate-spin text-hospital-600 mb-2" />
        <span className="text-xs">載入管理者模組中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-1">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
      >
        {/* Card Header */}
        <div className="bg-linear-to-b from-hospital-700 to-hospital-800 p-8 text-white text-center relative">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-teal-200 mx-auto mb-4 border border-white/10">
            <KeyRound size={26} />
          </div>

          <h2 className="font-display font-extrabold text-lg tracking-tight">
            {isSetup ? "光田後台 ‧ 安全身分驗證" : "光田後台 ‧ 首次管理者設定"}
          </h2>
          <p className="text-teal-200/90 text-2xs mt-1 max-w-[280px] mx-auto leading-relaxed">
            {isSetup 
              ? "此區域為光田內部餐飲負責同仁管理專區，請輸入管理密碼驗證。" 
              : "系統偵測到首次使用此點單系統，請立即建立您的管理者認證密碼。"}
          </p>
        </div>

        {/* Card Body / Form */}
        <div className="p-8">
          <form onSubmit={isSetup ? handleLogin : handleSetup} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-600 text-2xs leading-normal">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-slate-600 block">
                {isSetup ? "管理登入密碼" : "設定新管理密碼"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSetup ? "請輸入密碼" : "請輸入 4 位以上之安全密碼"}
                  className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password input (only if setting up) */}
            {!isSetup && (
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-slate-600 block">
                  再次確認密碼
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <CheckCircle2 size={14} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="請再次輸入密碼以確認"
                    className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 font-mono"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hospital-600 hover:bg-hospital-700 disabled:bg-slate-300 text-white font-semibold text-xs py-3 rounded-xl shadow-md shadow-hospital-600/15 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>正在驗證身分...</span>
                </>
              ) : (
                <>
                  <span>{isSetup ? "驗證密碼並進入" : "建立管理者密碼"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
