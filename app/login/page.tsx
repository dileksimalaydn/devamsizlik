"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // Kayıt modu mu yoksa Giriş modu mu olduğunu takip edelim
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      setMsg("⚠️ Lütfen email ve şifre girin.");
      return;
    }

    setLoading(true);
    setMsg("");

    if (isSignUpMode) {
      // KAYIT OLMA İŞLEMİ
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin, // Onaydan sonra buraya dön
        }
      });
      if (error) setMsg("❌ " + error.message);
      else setMsg("✅ Kayıt başarılı! Lütfen e-postanı kontrol et ve onayla.");
    } else {
      // GİRİŞ YAPMA İŞLEMİ
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("❌ " + error.message);
      else {
        setMsg("✅ Giriş başarılı, yönlendiriliyorsunuz...");
        router.replace("/dashboard");
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 360, margin: "60px auto", padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
        {isSignUpMode ? "Hesap Oluştur" : "Hoş Geldiniz"}
      </h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        {isSignUpMode ? "Yoklama takibine başlamak için kayıt ol." : "Devamsızlıklarını yönetmek için giriş yap."}
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="E-posta adresi"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none" }}
        />
        <input
          placeholder="Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none" }}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{ 
            padding: "12px", 
            borderRadius: "8px", 
            backgroundColor: "#000", 
            color: "#fff", 
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            border: "none"
          }}
        >
          {loading ? "İşleniyor..." : (isSignUpMode ? "Kaydı Tamamla" : "Giriş Yap")}
        </button>

        <div style={{ marginTop: 10, fontSize: 14 }}>
          {isSignUpMode ? "Zaten hesabın var mı?" : "Hesabın yok mu?"} 
          <span 
            onClick={() => { setIsSignUpMode(!isSignUpMode); setMsg(""); }}
            style={{ color: "#0070f3", cursor: "pointer", marginLeft: 5, fontWeight: "bold" }}
          >
            {isSignUpMode ? "Giriş Yap" : "Hemen Kayıt Ol"}
          </span>
        </div>

        {msg && (
          <div style={{ 
            marginTop: 20, 
            padding: "10px", 
            borderRadius: "8px", 
            backgroundColor: msg.includes("❌") ? "#fff5f5" : "#f0fff4",
            color: msg.includes("❌") ? "#c53030" : "#2f855a",
            fontSize: "14px"
          }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}