"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      setEmail(user.email ?? null);
    });
  }, [router]);

  async function handlePasswordChange() {
    if (!newPassword) { setMsg({ text: "Yeni şifre gir.", ok: false }); return; }
    if (newPassword.length < 8) { setMsg({ text: "Şifre en az 8 karakter olmalı.", ok: false }); return; }
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMsg({ text: "Hata: " + error.message, ok: false });
    else { setMsg({ text: "Şifre güncellendi!", ok: true }); setNewPassword(""); }
    setLoading(false);
  }

  const field = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">

        {/* Hesap bilgisi */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hesap</p>
          <p className="text-sm font-semibold text-slate-900">{email ?? "—"}</p>
        </div>

        {/* Şifre değiştir */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-5 space-y-3">
          <p className="text-sm font-bold text-slate-900">Şifre Değiştir</p>
          <input
            type="password"
            placeholder="Yeni şifre"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setMsg(null); }}
            onKeyDown={(e) => e.key === "Enter" && handlePasswordChange()}
            className={field}
          />
          <button
            onClick={handlePasswordChange}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Şifreyi Güncelle"}
          </button>
          {msg && (
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
              msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {msg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msg.text}
            </div>
          )}
        </div>

        {/* Çıkış yap */}
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
          className="w-full rounded-2xl border border-rose-200 bg-white py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition active:scale-95"
        >
          Çıkış Yap
        </button>

      </div>
      <BottomNav />
    </main>
  );
}
