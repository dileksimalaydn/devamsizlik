"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, ShieldOff } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // 2FA state
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaStep, setMfaStep] = useState<"idle" | "qr">("idle");
  const [qrCode, setQrCode] = useState("");
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [mfaActionLoading, setMfaActionLoading] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setEmail(user.email ?? null);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (token) {
        const res = await fetch("/api/admin/check", { headers: { Authorization: `Bearer ${token}` } });
        const { isAdmin: adminCheck } = await res.json();
        setIsAdmin(!!adminCheck);
      }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === "verified");
      setMfaEnrolled(!!verified);
      setMfaFactorId(verified?.id ?? null);
      setMfaLoading(false);
    })();
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

  async function handleMfaEnroll() {
    setMfaActionLoading(true);
    setMfaMsg(null);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "yoklama" });
    if (error || !data) {
      setMfaMsg({ text: "Hata: " + (error?.message ?? "bilinmiyor"), ok: false });
    } else {
      setQrCode(data.totp.qr_code);
      setEnrollFactorId(data.id);
      setMfaStep("qr");
    }
    setMfaActionLoading(false);
  }

  async function handleMfaVerify() {
    if (!enrollFactorId || totpCode.length !== 6) return;
    setMfaActionLoading(true);
    setMfaMsg(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollFactorId, code: totpCode });
    if (error) {
      setMfaMsg({ text: "Kod hatalı, tekrar dene.", ok: false });
      setTotpCode("");
    } else {
      setMfaEnrolled(true);
      setMfaFactorId(enrollFactorId);
      setMfaStep("idle");
      setTotpCode("");
      setMfaMsg({ text: "2FA başarıyla kuruldu!", ok: true });
    }
    setMfaActionLoading(false);
  }

  async function handleMfaUnenroll() {
    if (!mfaFactorId) return;
    setMfaActionLoading(true);
    setMfaMsg(null);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });
    if (error) {
      setMfaMsg({ text: "Hata: " + error.message, ok: false });
    } else {
      setMfaEnrolled(false);
      setMfaFactorId(null);
      setMfaMsg({ text: "2FA kaldırıldı.", ok: true });
    }
    setMfaActionLoading(false);
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

        {/* 2FA - sadece admin */}
        {isAdmin && <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-5 space-y-3">
          <p className="text-sm font-bold text-slate-900">İki Faktörlü Doğrulama (2FA)</p>

          {mfaLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> Kontrol ediliyor...
            </div>
          ) : mfaEnrolled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                <ShieldCheck size={16} /> 2FA aktif
              </div>
              <button
                onClick={handleMfaUnenroll}
                disabled={mfaActionLoading}
                className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors disabled:opacity-60"
              >
                <ShieldOff size={14} />
                {mfaActionLoading ? "Kaldırılıyor..." : "2FA'yı Kaldır"}
              </button>
            </div>
          ) : mfaStep === "idle" ? (
            <button
              onClick={handleMfaEnroll}
              disabled={mfaActionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-60"
            >
              {mfaActionLoading ? <Loader2 size={16} className="animate-spin" /> : "2FA Kur"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Google Authenticator veya Authy ile QR kodu okut, ardından 6 haneli kodu gir.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="2FA QR" className="w-40 h-40 mx-auto rounded-xl border border-slate-200 bg-white p-1" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="6 haneli kod"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleMfaVerify()}
                className={field}
                maxLength={6}
              />
              <button
                onClick={handleMfaVerify}
                disabled={totpCode.length !== 6 || mfaActionLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-60"
              >
                {mfaActionLoading ? <Loader2 size={16} className="animate-spin" /> : "Doğrula ve Aktifleştir"}
              </button>
            </div>
          )}

          {mfaMsg && (
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
              mfaMsg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {mfaMsg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {mfaMsg.text}
            </div>
          )}
        </div>}

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
