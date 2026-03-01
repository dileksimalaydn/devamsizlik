"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AlertCircle, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsReset(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleResetPassword() {
    if (!newPassword) { setMsg({ text: "Yeni şifre gir.", ok: false }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMsg({ text: "Hata: " + error.message, ok: false });
    else { setMsg({ text: "Şifre güncellendi!", ok: true }); setTimeout(() => router.replace("/dashboard"), 1500); }
    setLoading(false);
  }

  async function handleForgot() {
    if (!email) {
      setMsg({ text: "E-posta adresini gir.", ok: false });
      return;
    }
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setMsg({ text: "Hata: " + error.message, ok: false });
    else setMsg({ text: "Şifre sıfırlama maili gönderildi!", ok: true });
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setMsg({ text: "Google ile giriş başarısız.", ok: false });
      setLoading(false);
    }
  }

  async function handleAuth() {
    if (!email || !password) {
      setMsg({ text: "E-posta ve şifre girilmeli.", ok: false });
      return;
    }
    setLoading(true);
    setMsg(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setMsg({ text: "Hata: " + error.message, ok: false });
      } else if (data.session) {
        const token = data.session.access_token;
        const res = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { isAdmin } = await res.json();
        router.replace(isAdmin ? "/admin" : "/dashboard");
        return;
      } else {
        setMsg({ text: "Başarılı! E-postanı kontrol et.", ok: true });
      }
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg({ text: "E-posta veya şifre hatalı.", ok: false });
      } else {
        const token = data.session?.access_token;
        const res = await fetch("/api/admin/check", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const { isAdmin } = await res.json();
        router.replace(isAdmin ? "/admin" : "/dashboard");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600 shadow-lg shadow-indigo-900/30">
          <GraduationCap size={32} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            yoklama
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isReset
              ? "Yeni şifreni gir."
              : isForgot
              ? "Şifreni sıfırlamak için e-postanı gir."
              : isSignUp
              ? "Takibe başlamak için hesap oluştur."
              : "Devamsızlıklarını takip etmek için giriş yap."}
          </p>
        </div>
      </div>

      {/* Kart */}
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-6 shadow-2xl border border-slate-800">
        <h2 className="mb-5 text-base font-bold text-white">
          {isReset ? "Yeni Şifre Belirle" : isForgot ? "Şifremi Unuttum" : isSignUp ? "Hesap Oluştur" : "Tekrar Hoş Geldin"}
        </h2>

        <div className="space-y-3">
          {/* Şifre sıfırlama modu */}
          {isReset ? (
            <>
              <input
                type="password"
                placeholder="Yeni şifre"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-700 transition-all"
              />
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Şifreyi Güncelle"}
              </button>
            </>
          ) : isForgot ? (
            <>
              <input
                type="email"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleForgot()}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-700 transition-all"
              />
              <button
                onClick={handleForgot}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Sıfırlama Maili Gönder"}
              </button>
              <p className="pt-1 text-center text-sm text-slate-400">
                <button
                  onClick={() => { setIsForgot(false); setMsg(null); }}
                  className="font-semibold text-white hover:underline"
                >
                  Geri Dön
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-60"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  width={18}
                  alt="Google"
                />
                Google ile devam et
              </button>

              {/* Ayırıcı */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-700" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  veya
                </span>
                <div className="h-px flex-1 bg-slate-700" />
              </div>

              {/* E-posta */}
              <input
                type="email"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-700 transition-all"
              />

              {/* Şifre */}
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-700 transition-all"
              />

              {/* Submit */}
              <button
                onClick={handleAuth}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isSignUp ? (
                  "Hesap Oluştur"
                ) : (
                  "Giriş Yap"
                )}
              </button>

              {/* Toggle + Şifremi Unuttum */}
              <div className="pt-1 flex items-center justify-between text-sm text-slate-400">
                <span>
                  {isSignUp ? "Hesabın var mı?" : "Hesabın yok mu?"}{" "}
                  <button
                    onClick={() => { setIsSignUp(!isSignUp); setMsg(null); }}
                    className="font-semibold text-white hover:underline"
                  >
                    {isSignUp ? "Giriş Yap" : "Kayıt Ol"}
                  </button>
                </span>
                {!isSignUp && (
                  <button
                    onClick={() => { setIsForgot(true); setMsg(null); }}
                    className="text-slate-500 hover:text-white hover:underline transition-colors"
                  >
                    Şifremi unuttum
                  </button>
                )}
              </div>
            </>
          )}

          {/* Mesaj */}
          {msg && (
            <div
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
                msg.ok
                  ? "border-emerald-800 bg-emerald-950 text-emerald-400"
                  : "border-rose-900 bg-rose-950 text-rose-400"
              }`}
            >
              {msg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {msg.text}
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-300 font-medium">
        Developed by Dilek Şimal Aydın · devamsizlik.com
      </p>
    </div>
  );
}
