"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UserRow = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  course_count: number;
  attendance_count: number;
  school: string | null;
};

type OnlineUser = {
  user_id: string;
  page: string;
  online_at: string;
};

// Presence kanalında kabul edilen sayfa isimleri — başka değer gelirse reddedilir
const VALID_PAGES = new Set(["Dashboard", "Özet", "Dersler", "Haftalık"]);

type CourseRow = {
  course_name: string;
  day: string;
  start: string;
  end: string;
  blocks: number;
  course_type: string;
};

export default function AdminClient() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userCourses, setUserCourses] = useState<CourseRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  // 2FA state
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [mfaStep, setMfaStep] = useState<"idle" | "qr">("idle");
  const [qrCode, setQrCode] = useState("");
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function loadUsers(t: string) {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${t}` },
    });
    // 401 veya 403 → 404 göster, admin panelinin varlığını sızdırma
    if (res.status === 401 || res.status === 403) return notFound();
    if (!res.ok) { setError("Sunucu hatası."); setLoading(false); return; }
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return notFound();
      setToken(session.access_token);
      await loadUsers(session.access_token);
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === "verified");
      setMfaEnrolled(!!verified);
    })();
  }, [router]);

  async function handleMfaEnroll() {
    setMfaLoading(true);
    setMfaMsg(null);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "yoklama-admin" });
    if (error || !data) {
      setMfaMsg({ text: "Hata: " + (error?.message ?? "bilinmiyor"), ok: false });
    } else {
      setQrCode(data.totp.qr_code);
      setEnrollFactorId(data.id);
      setMfaStep("qr");
    }
    setMfaLoading(false);
  }

  async function handleMfaVerify() {
    if (!enrollFactorId || totpCode.length !== 6) return;
    setMfaLoading(true);
    setMfaMsg(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollFactorId, code: totpCode });
    if (error) {
      setMfaMsg({ text: "Kod hatalı, tekrar dene.", ok: false });
      setTotpCode("");
    } else {
      setMfaEnrolled(true);
      setMfaStep("idle");
      setTotpCode("");
      setMfaMsg({ text: "2FA kuruldu! Bir sonraki girişten itibaren aktif.", ok: true });
    }
    setMfaLoading(false);
  }

  // Realtime presence — presence verisi güvenilmez, çapraz kontrol yapılıyor
  useEffect(() => {
    const channel = supabase.channel("app-presence");
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ page?: string; online_at?: string }>();
        const verified: OnlineUser[] = [];
        for (const [userId, presences] of Object.entries(state)) {
          const p = presences[0];
          if (!p) continue;
          // Sadece whitelist'teki sayfa isimlerine izin ver
          const page = p.page && VALID_PAGES.has(p.page) ? p.page : null;
          if (!page) continue;
          verified.push({
            user_id: userId,
            page,
            online_at: p.online_at ?? new Date().toISOString(),
          });
        }
        setOnline(verified);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function openDetail(user: UserRow) {
    setSelectedUser(user);
    setUserCourses([]);
    setDetailLoading(true);
    const res = await fetch(`/api/admin/user-detail?id=${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUserCourses(data.courses);
    }
    setDetailLoading(false);
  }

  async function handleDelete(userId: string) {
    const res = await fetch(`/api/admin/users?id=${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    }
    setDeletingId(null);
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Yükleniyor...</div>
  );
  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-rose-600 dark:text-rose-400">Hata: {error}</div>
  );

  const now = new Date();
  const today = now.toDateString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayCount = users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at).toDateString() === today).length;
  const weekCount = users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= weekAgo).length;
  const monthCount = users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= monthAgo).length;

  const filtered = users.filter((u) =>
    !search || (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Çıkış Yap
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Toplam", value: users.length, color: "text-foreground" },
          { label: "Bugün Aktif", value: todayCount, color: "text-primary" },
          { label: "Son 7 Gün", value: weekCount, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Son 30 Gün", value: monthCount, color: "text-amber-600 dark:text-amber-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Online */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="bg-card px-4 py-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold">Şu An Online ({online.length})</span>
        </div>
        {(() => {
          // Sadece gerçek kullanıcılarla eşleşen presence kayıtlarını göster
          const verifiedOnline = online.filter((o) =>
            users.some((u) => u.id === o.user_id)
          );
          return verifiedOnline.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Kimse online değil.</p>
          ) : (
            <div className="divide-y divide-border">
              {verifiedOnline.map((o) => {
                const realUser = users.find((u) => u.id === o.user_id);
                return (
                  <div key={o.user_id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{realUser?.email ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{o.page}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(o.online_at).toLocaleTimeString("tr-TR")}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Arama */}
      <input
        type="text"
        placeholder="E-posta ile ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition"
      />

      {/* Kullanıcı tablosu */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="bg-card px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Kullanıcılar</span>
          <span className="text-xs text-muted-foreground">{filtered.length} sonuç</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/50 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Okul</th>
                <th className="px-4 py-3 font-medium">Ders</th>
                <th className="px-4 py-3 font-medium">Devamsızlık</th>
                <th className="px-4 py-3 font-medium">Kayıt</th>
                <th className="px-4 py-3 font-medium">Son Giriş</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <>
                  <tr
                    key={u.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${i % 2 === 0 ? "bg-background" : "bg-card/30"}`}
                    onClick={() => openDetail(u)}
                  >
                    <td className="px-4 py-3 font-medium">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                        {u.school ?? "ieu"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary">{u.course_count}</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{u.attendance_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("tr-TR") : "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {deletingId === u.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleDelete(u.id)} className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold">Sil</button>
                          <button onClick={() => setDeletingId(null)} className="text-xs text-muted-foreground hover:text-foreground">İptal</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(u.id)}
                          className="text-xs text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          Sil
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Detay satırı */}
                  {selectedUser?.id === u.id && (
                    <tr key={`${u.id}-detail`} className="bg-card/60">
                      <td colSpan={6} className="px-4 py-4">
                        {detailLoading ? (
                          <p className="text-xs text-muted-foreground">Yükleniyor...</p>
                        ) : userCourses.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Kayıtlı ders yok.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {userCourses.map((c, idx) => (
                              <span key={idx} className="rounded-xl bg-muted border border-border px-3 py-1.5 text-xs">
                                <span className="font-bold text-foreground">{c.course_name}</span>
                                <span className="text-muted-foreground ml-1">{c.day} {c.start}–{c.end}</span>
                                <span className={`ml-1 font-semibold ${c.course_type === "lab" ? "text-violet-700 dark:text-violet-300" : "text-sky-700 dark:text-sky-300"}`}>
                                  {c.course_type === "lab" ? "LAB" : "TEORİK"}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2FA */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">İki Faktörlü Doğrulama (2FA)</p>
          {mfaEnrolled && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">Aktif</span>
          )}
        </div>

        {mfaEnrolled ? (
          <p className="text-xs text-muted-foreground">2FA aktif. Giriş yaparken telefon kodu gerekiyor.</p>
        ) : mfaStep === "idle" ? (
          <button
            onClick={handleMfaEnroll}
            disabled={mfaLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-muted border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/70 transition disabled:opacity-60"
          >
            {mfaLoading ? "Yükleniyor..." : "2FA Kur"}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Google Authenticator ile QR kodu okut, ardından 6 haneli kodu gir.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="2FA QR" className="w-36 h-36 rounded-xl bg-white p-1" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="6 haneli kod"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleMfaVerify()}
              maxLength={6}
              className="w-48 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring tracking-widest text-center"
            />
            <button
              onClick={handleMfaVerify}
              disabled={totpCode.length !== 6 || mfaLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
            >
              {mfaLoading ? "Doğrulanıyor..." : "Doğrula ve Aktifleştir"}
            </button>
          </div>
        )}

        {mfaMsg && (
          <p className={`text-xs font-medium ${mfaMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {mfaMsg.text}
          </p>
        )}
      </div>

    </div>
  );
}
