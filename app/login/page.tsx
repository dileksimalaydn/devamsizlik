"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

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
      setMsg("Google error: " + error.message);
      setLoading(false);
    }
  }

  async function handleAuth() {
    if (!email || !password) {
      setMsg("Please enter email and password.");
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
      if (error) setMsg("Error: " + error.message);
      else setMsg("Success! Please check your email for confirmation.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Error: " + error.message);
      else {
        setMsg("Login successful, redirecting...");
        router.replace("/dashboard");
      }
    }
    setLoading(false);
  }

  // Modern Input Stili (Email ve Password için)
  const inputStyle = {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #334155", // Belirgin koyu kenarlık
    outline: "none",
    fontSize: 14,
    backgroundColor: "#1e293b", // Arka plandan bir tık açık, kutuyu belli eden renk
    color: "#ffffff",
    transition: "all 0.2s"
  };

  return (
    <div style={{ maxWidth: 380, margin: "60px auto", padding: "40px 20px", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>
        {isSignUpMode ? "Create Account" : "Welcome Back"}
      </h1>
      <p style={{ color: "#64748b", marginBottom: 30, fontSize: 15 }}>
        {isSignUpMode ? "Sign up to start tracking attendance." : "Login to manage your absences."}
      </p>

      <div style={{ display: "grid", gap: 15 }}>
        
        {/* GOOGLE BUTTON */}
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
            gap: "12px"
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "10px 0", color: "#e2e8f0" }}>
          <hr style={{ flex: 1, border: "0.5px solid #334155" }} /> 
          <span style={{ padding: "0 15px", fontSize: 11, fontWeight: "bold", color: "#94a3b8" }}>OR</span> 
          <hr style={{ flex: 1, border: "0.5px solid #334155" }} />
        </div>

        {/* INPUT FIELDS */}
        <input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleAuth}
          disabled={loading}
          style={{ 
            padding: "14px", 
            borderRadius: "10px", 
            backgroundColor: "#ffffff", 
            color: "#0f172a", 
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (isSignUpMode ? "Complete Sign Up" : "Login")}
        </button>

        {/* TOGGLE MODE */}
        <div style={{ marginTop: 15, fontSize: 14, color: "#64748b" }}>
          {isSignUpMode ? "Already have an account?" : "Don't have an account?"} 
          <span 
            onClick={() => { setIsSignUpMode(!isSignUpMode); setMsg(""); }}
            style={{ color: "#3b82f6", cursor: "pointer", marginLeft: 5, fontWeight: "600" }}
          >
            {isSignUpMode ? "Login" : "Sign Up Now"}
          </span>
        </div>

        {/* FEEDBACK MESSAGES */}
        {msg && (
          <div style={{ 
            marginTop: 20, 
            padding: "12px", 
            borderRadius: "10px", 
            backgroundColor: msg.includes("Error") || msg.includes("Please") ? "#450a0a" : "#064e3b",
            color: msg.includes("Error") || msg.includes("Please") ? "#fca5a5" : "#6ee7b7",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: `1px solid ${msg.includes("Error") ? "#991b1b" : "#065f46"}`
          }}>
            {msg.includes("Error") || msg.includes("Please") ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}