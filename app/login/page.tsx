"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// İkonları import ediyoruz
import { AlertCircle, CheckCircle2, Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`, 
      },
    });

    if (error) {
      setMsg("Google hatası: " + error.message);
      setLoading(false);
    }
  }

  async function handleAuth() {
    if (!email || !password) {
      setMsg("Lütfen email ve şifre girin.");
      return;
    }

    setLoading(true);
    setMsg("");

    if (isSignUpMode) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) setMsg("Hata: " + error.message);
      else setMsg("Kayıt başarılı! Lütfen e-postanı kontrol et ve onayla.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Hata: " + error.message);
      else {
        setMsg("Giriş başarılı, yönlendiriliyorsunuz...");
        router.replace("/dashboard");
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 380, margin: "60px auto", padding: "40px 20px", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>
        {isSignUpMode ? "Hesap Oluştur" : "Hoş Geldiniz"}
      </h1>
      <p style={{ color: "#64748b", marginBottom: 30, fontSize: 15 }}>
        {isSignUpMode ? "Yoklama takibine başlamak için kayıt ol." : "Devamsızlıklarını yönetmek için giriş yap."}
      </p>

      <div style={{ display: "grid", gap: 15 }}>
        
        {/* GOOGLE BUTONU */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ 
            padding: "12px", 
            borderRadius: "10px", 
            backgroundColor: "#fff", 
            color: "#1e293b", 
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            transition: "all 0.2s"
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          Google ile Devam Et
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "10px 0", color: "#e2e8f0" }}>
          <hr style={{ flex: 1, border: "0.5px solid #e2e8f0" }} /> 
          <span style={{ padding: "0 15px", fontSize: 11, fontWeight: "bold", color: "#94a3b8" }}>VEYA</span> 
          <hr style={{ flex: 1, border: "0.5px solid #e2e8f0" }} />
        </div>

        <input
          placeholder="E-posta adresi"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: 14, backgroundColor: "#f8fafc" }}
        />
        <input
          placeholder="Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: 14, backgroundColor: "#f8fafc" }}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{ 
            padding: "14px", 
            borderRadius: "10px", 
            backgroundColor: "#0f172a", 
            color: "#fff", 
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (isSignUpMode ? "Kaydı Tamamla" : "Giriş Yap")}
        </button>

        <div style={{ marginTop: 15, fontSize: 14, color: "#64748b" }}>
          {isSignUpMode ? "Zaten hesabın var mı?" : "Hesabın yok mu?"} 
          <span 
            onClick={() => { setIsSignUpMode(!isSignUpMode); setMsg(""); }}
            style={{ color: "#2563eb", cursor: "pointer", marginLeft: 5, fontWeight: "600" }}
          >
            {isSignUpMode ? "Giriş Yap" : "Hemen Kayıt Ol"}
          </span>
        </div>

        {msg && (
          <div style={{ 
            marginTop: 20, 
            padding: "12px", 
            borderRadius: "10px", 
            backgroundColor: msg.includes("Hata") || msg.includes("Lütfen") ? "#fef2f2" : "#f0fdf4",
            color: msg.includes("Hata") || msg.includes("Lütfen") ? "#991b1b" : "#166534",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: `1px solid ${msg.includes("Hata") ? "#fee2e2" : "#dcfce7"}`
          }}>
            {msg.includes("Hata") || msg.includes("Lütfen") ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}