"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AlertCircle, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { SCHOOLS } from "@/lib/schools";

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [isMfa, setIsMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [school, setSchool] = useState("ieu");
  const pendingRef = useRef<"auth" | "forgot" | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsReset(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleResetPassword() {
    if (!newPassword) { setMsg({ text: "Yeni şifre gir.", ok: false }); return; }
    if (newPassword.length < 8) { setMsg({ text: "Şifre en az 8 karakter olmalı.", ok: false }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMsg({ text: "Hata: " + error.message, ok: false });
    else { setMsg({ text: "Şifre güncellendi!", ok: true }); setTimeout(() => router.replace("/dashboard"), 1500); }
    setLoading(false);
  }

  async function handleMfaChallenge() {
    if (!mfaFactorId || mfaCode.length !== 6) return;
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode });
    if (error) {
      setMsg({ text: "Kod hatalı, tekrar dene.", ok: false });
      setMfaCode("");
    } else {
      router.replace("/dashboard");
    }
    setLoading(false);
  }

  async function handleForgot(token?: string) {
    if (!email) {
      setMsg({ text: "E-posta adresini gir.", ok: false });
      return;
    }
    const tok = token ?? captchaToken;
    if (!tok) {
      pendingRef.current = "forgot";
      turnstileRef.current?.execute();
      return;
    }
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
      captchaToken: tok,
    });
    if (error) {
      setMsg({ text: "Hata: " + error.message, ok: false });
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    } else {
      setMsg({ text: "Şifre sıfırlama maili gönderildi!", ok: true });
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    sessionStorage.setItem("oauth_pending", "1");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setMsg({ text: "Google ile giriş başarısız.", ok: false });
      setLoading(false);
    }
  }

  async function handleAuth(token?: string) {
    if (!email || !password) {
      setMsg({ text: "E-posta ve şifre girilmeli.", ok: false });
      return;
    }
    if (isSignUp && !kvkkAccepted) {
      setMsg({ text: "Devam etmek için KVKK Aydınlatma Metni'ni onaylamalısın.", ok: false });
      return;
    }
    const tok = token ?? captchaToken;
    if (!tok) {
      pendingRef.current = "auth";
      turnstileRef.current?.execute();
      return;
    }
    setLoading(true);
    setMsg(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, captchaToken: tok, data: { school } },
      });
      if (error) {
        setMsg({ text: "Hata: " + error.message, ok: false });
      } else {
        if (data.user) {
          await supabase.from("profiles").insert({ user_id: data.user.id, school });
          localStorage.setItem("school_feature_v1", "1"); // yeni üye, banner gösterme
        }
        if (data.session) {
          router.replace("/dashboard");
          return;
        }
        setMsg({ text: "Başarılı! E-postanı kontrol et.", ok: true });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: tok } });
      if (error) {
        setMsg({ text: "E-posta veya şifre hatalı.", ok: false });
        turnstileRef.current?.reset();
        setCaptchaToken(null);
      } else {
        // 2FA kontrolü
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const factor = factors?.totp?.find((f) => f.status === "verified");
          if (factor) {
            setMfaFactorId(factor.id);
            setIsMfa(true);
            setLoading(false);
            return;
          }
        }
        router.replace("/dashboard");
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
          {isMfa ? "İki Faktörlü Doğrulama" : isReset ? "Yeni Şifre Belirle" : isForgot ? "Şifremi Unuttum" : isSignUp ? "Hesap Oluştur" : "Tekrar Hoş Geldin"}
        </h2>

        <div className="space-y-3">
          {/* Şifre sıfırlama modu */}
          {isMfa ? (
            <>
              <p className="text-sm text-slate-400 -mt-2">Authenticator uygulamanızdaki 6 haneli kodu gir.</p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6 haneli kod"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleMfaChallenge()}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-700 transition-all tracking-widest text-center text-lg"
                maxLength={6}
                autoFocus
              />
              <button
                onClick={handleMfaChallenge}
                disabled={loading || mfaCode.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Doğrula"}
              </button>
            </>
          ) : isReset ? (
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
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  if (pendingRef.current === "forgot") {
                    pendingRef.current = null;
                    handleForgot(token);
                  }
                }}
                onExpire={() => { setCaptchaToken(null); turnstileRef.current?.execute(); }}
                options={{ theme: "dark", size: "invisible" }}
              />
              <button
                onClick={() => handleForgot()}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Sıfırlama Maili Gönder"}
              </button>
              <p className="pt-1 text-center text-sm text-slate-400">
                <button
                  onClick={() => { setIsForgot(false); setMsg(null); setCaptchaToken(null); turnstileRef.current?.reset(); }}
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
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Google ile devam ederek{" "}
                <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-medium">KVKK Aydınlatma Metni</a>'ni
                {" "}okuduğunu ve kişisel verilerinin işlenmesini kabul ettiğini onaylarsın.
              </p>

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

              {/* Okul seçimi — sadece kayıt modunda */}
              {isSignUp && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    Üniversiten
                  </label>
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-700 transition-all"
                  >
                    {SCHOOLS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {school !== "ieu" && (
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Ders saatlerini manuel girebilirsin.
                    </p>
                  )}
                </div>
              )}

              {/* KVKK onayı — sadece kayıt modunda */}
              {isSignUp && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={kvkkAccepted}
                    onChange={(e) => setKvkkAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 accent-indigo-500 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-medium">KVKK Aydınlatma Metni</a>'ni okudum; kişisel verilerimin burada belirtilen amaçlar doğrultusunda işlenmesini ve aktarılmasını <span className="text-white font-medium">açık rızamla onaylıyorum</span>.
                  </span>
                </label>
              )}

              {/* Turnstile */}
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  if (pendingRef.current === "auth") {
                    pendingRef.current = null;
                    handleAuth(token);
                  }
                }}
                onExpire={() => { setCaptchaToken(null); turnstileRef.current?.execute(); }}
                options={{ theme: "dark", size: "invisible" }}
              />

              {/* Submit */}
              <button
                onClick={() => handleAuth()}
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
