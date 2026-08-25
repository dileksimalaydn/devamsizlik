"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AlertCircle, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!newPassword) { setMsg({ text: "Yeni şifre gir.", ok: false }); return; }
    if (newPassword.length < 8) { setMsg({ text: "Şifre en az 8 karakter olmalı.", ok: false }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMsg({ text: "Hata: " + error.message, ok: false });
    } else {
      setMsg({ text: "Şifre güncellendi!", ok: true });
      setTimeout(() => router.replace("/dashboard"), 1500);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary shadow-lg shadow-primary/30">
          <GraduationCap size={32} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">yoklama</h1>
          <p className="mt-1 text-sm text-muted-foreground">Yeni şifreni belirle.</p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl border border-border">
        <h2 className="mb-5 text-base font-bold text-foreground">Yeni Şifre Belirle</h2>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Yeni şifre"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
          />
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Şifreyi Güncelle"}
          </button>
          {msg && (
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
              msg.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}>
              {msg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
