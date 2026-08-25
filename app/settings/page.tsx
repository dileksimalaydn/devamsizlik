"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { CheckCircle2, AlertCircle, Loader2, Moon, Sun } from "lucide-react";
import { SCHOOLS, isIEU, schoolLabel } from "@/lib/schools";
import { getStoredTheme, applyTheme, type Theme } from "@/lib/theme";

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

  // Görünüm (tema)
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);
  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSchoolMsg({ text: "Oturumun sona ermiş, tekrar giriş yapman gerekiyor.", ok: false });
        router.replace("/login");
        return;
      }

      // IEU <-> diğer geçişinde tüm verileri sil
      if (willReset) {
        await supabase.from("courses").delete().eq("user_id", user.id);
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, school: pendingSchool });
      if (error) {
        setSchoolMsg({ text: "Hata: " + error.message, ok: false });
      } else {
        setSchool(pendingSchool);
        setSchoolMode(false);
        if (isNewUser) { router.replace("/setup"); return; }
        setSchoolMsg({ text: "Okul güncellendi!", ok: true });
        setTimeout(() => setSchoolMsg(null), 3000);
      }
    } catch {
      setSchoolMsg({ text: "Beklenmeyen bir hata oluştu, tekrar dene.", ok: false });
    } finally {
      setSchoolLoading(false);
    }
  }

  const field = "w-full rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  return (
    <main className="min-h-screen bg-background pb-32">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">

        {/* Yeni kullanıcı banner */}
        {isNewUser && (
          <div className="flex items-start gap-3 rounded-3xl border border-violet-300 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-4 py-4 text-sm text-violet-800 dark:text-violet-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-300" />
            <span>
              <strong>Üniversiteni seç!</strong> Google ile kaydoldun, devam etmeden önce hangi üniversitede okuduğunu belirt.
            </span>
          </div>
        )}

        {/* Görünüm (tema) */}
        <div className="rounded-3xl bg-card border border-border shadow-sm p-5 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Görünüm</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-all ${
                theme === "dark"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border"
              }`}
            >
              <Moon size={15} /> Koyu
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-all ${
                theme === "light"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border"
              }`}
            >
              <Sun size={15} /> Açık
            </button>
          </div>
        </div>

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
                <div className="flex items-start gap-2 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
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
              schoolMsg.ok ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
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
              msg.ok ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}>
              {msg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msg.text}
            </div>
          )}
        </div>

        {/* Çıkış yap */}
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
          className="w-full rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-card py-3 text-sm font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition active:scale-95"
        >
          Çıkış Yap
        </button>

      </div>
      <BottomNav />
    </main>
  );
}

