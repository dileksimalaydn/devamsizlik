"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SCHOOLS, isIEU, schoolLabel } from "@/lib/schools";

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("yeni") === "1";
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Okul
  const [school, setSchool] = useState<string>("ieu");
  const [pendingSchool, setPendingSchool] = useState<string>("ieu");
  const [schoolMode, setSchoolMode] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolMsg, setSchoolMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const willReset = isIEU(school) !== isIEU(pendingSchool);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setEmail(user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("school")
        .eq("user_id", user.id)
        .single();
      const s = profile?.school ?? "ieu";
      setSchool(s);
      setPendingSchool(s);
      // Eski e-posta kullanıcıları için profil satırı yoksa oluştur
      if (!profile) {
        await supabase.from("profiles").upsert({ user_id: user.id, school: "ieu" });
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    if (isNewUser) setSchoolMode(true);
  }, [isNewUser]);

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

  async function handleSchoolChange() {
    if (pendingSchool === school && !isNewUser) { setSchoolMode(false); return; }
    setSchoolLoading(true);
    setSchoolMsg(null);

    // IEU <-> diğer geçişinde tüm verileri sil
    const { data: { user } } = await supabase.auth.getUser();
    if (willReset && user) {
      await supabase.from("courses").delete().eq("user_id", user.id);
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user!.id, school: pendingSchool });
    if (error) {
      setSchoolMsg({ text: "Hata: " + error.message, ok: false });
    } else {
      setSchool(pendingSchool);
      setSchoolMode(false);
      if (isNewUser) { router.replace("/setup"); return; }
      setSchoolMsg({ text: "Okul güncellendi!", ok: true });
      setTimeout(() => setSchoolMsg(null), 3000);
    }
    setSchoolLoading(false);
  }

  const field = "w-full rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  return (
    <main className="min-h-screen bg-background pb-32">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">

        {/* Yeni kullanıcı banner */}
        {isNewUser && (
          <div className="flex items-start gap-3 rounded-3xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-sm text-indigo-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-indigo-500" />
            <span>
              <strong>Üniversiteni seç!</strong> Google ile kaydoldun, devam etmeden önce hangi üniversitede okuduğunu belirt.
            </span>
          </div>
        )}

        {/* Hesap bilgisi */}
        <div className="rounded-3xl bg-card border border-border shadow-sm p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Hesap</p>
          <p className="text-sm font-semibold text-foreground">{email ?? "—"}</p>
        </div>

        {/* Okul */}
        <div className="rounded-3xl bg-card border border-border shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Üniversite</p>
              <p className="text-sm font-semibold text-foreground">{schoolLabel(school)}</p>
            </div>
            {!schoolMode && (
              <button
                onClick={() => { setSchoolMode(true); setPendingSchool(school); setSchoolMsg(null); }}
                className="rounded-2xl bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition"
              >
                Değiştir
              </button>
            )}
          </div>

          {schoolMode && (
            <>
              <select
                value={pendingSchool}
                onChange={(e) => setPendingSchool(e.target.value)}
                className={field}
              >
                {SCHOOLS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {willReset && (
                <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>
                    <strong>Dikkat:</strong> Bu değişiklik tüm derslerini ve devamsızlık kayıtlarını kalıcı olarak silecek. Geri alınamaz.
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setSchoolMode(false); setPendingSchool(school); }}
                  className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleSchoolChange}
                  disabled={schoolLoading || (pendingSchool === school && !isNewUser)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold transition disabled:opacity-60 ${
                    willReset ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {schoolLoading ? <Loader2 size={15} className="animate-spin" /> : willReset ? "Sil ve Güncelle" : "Kaydet"}
                </button>
              </div>
            </>
          )}

          {schoolMsg && (
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
              schoolMsg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {schoolMsg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {schoolMsg.text}
            </div>
          )}
        </div>

        {/* Şifre değiştir */}
        <div className="rounded-3xl bg-card border border-border shadow-sm p-5 space-y-3">
          <p className="text-sm font-bold text-foreground">Şifre Değiştir</p>
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition active:scale-95 disabled:opacity-60"
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
          className="w-full rounded-2xl border border-rose-200 bg-card py-3 text-sm font-bold text-rose-600 hover:bg-rose-50/10 transition active:scale-95"
        >
          Çıkış Yap
        </button>

      </div>
      <BottomNav />
    </main>
  );
}

