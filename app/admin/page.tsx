"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UserRow = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
};

type OnlineUser = {
  user_id: string;
  email: string;
  page: string;
  online_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kullanıcı listesini yükle
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 401) { router.replace("/login"); return; }
      if (res.status === 403) { router.replace("/"); return; }
      if (!res.ok) { setError("Sunucu hatası."); setLoading(false); return; }

      const data = await res.json();
      setUsers(data.users);
      setLoading(false);
    }
    load();
  }, [router]);

  // Realtime presence — kim online
  useEffect(() => {
    const channel = supabase.channel("app-presence");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        const list = Object.values(state).flat();
        setOnline(list);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400">
        Hata: {error}
      </div>
    );
  }

  const today = new Date().toDateString();
  const todayCount = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).toDateString() === today
  ).length;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekCount = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= weekAgo
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Çıkış Yap
        </button>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Toplam Kullanıcı</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Bugün Aktif</p>
          <p className="text-3xl font-bold text-indigo-400">{todayCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Son 7 Gün</p>
          <p className="text-3xl font-bold text-emerald-400">{weekCount}</p>
        </div>
      </div>

      {/* Şu an online */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold">Şu An Online ({online.length})</span>
        </div>
        {online.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-500">Kimse online değil.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {online.map((u) => (
              <div key={u.user_id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{u.email}</p>
                  <p className="text-xs text-slate-400">{u.page}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(u.online_at).toLocaleTimeString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kullanıcı tablosu */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-900 px-4 py-3">
          <span className="text-sm font-semibold">Tüm Kullanıcılar</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Kayıt</th>
              <th className="px-4 py-3 font-medium">Son Giriş</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr
                key={u.id}
                className={i % 2 === 0 ? "bg-slate-950" : "bg-slate-900/30"}
              >
                <td className="px-4 py-3">{u.email ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(u.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {u.last_sign_in_at
                    ? new Date(u.last_sign_in_at).toLocaleDateString("tr-TR")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
