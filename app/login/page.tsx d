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

  async function signIn() {
    setLoading(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg("❌ " + error.message);
    else {
      setMsg("✅ Giriş başarılı");
      router.replace("/dashboard");
    }
    setLoading(false);
  }

  async function signUp() {
    setLoading(true);
    setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg("❌ " + error.message);
    else setMsg("✅ Kayıt oluşturuldu. (Email confirmation açıksa mail beklemen gerekebilir)");
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 360, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Giriş</h1>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #333" }}
        />
        <input
          placeholder="Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #333" }}
        />

        <button
          onClick={signIn}
          disabled={loading}
          style={{ padding: 10, borderRadius: 10 }}
        >
          {loading ? "..." : "Giriş yap"}
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          style={{ padding: 10, borderRadius: 10 }}
        >
          {loading ? "..." : "Kayıt ol"}
        </button>

        {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
      </div>
    </div>
  );
}