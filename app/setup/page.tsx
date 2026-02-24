"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/lib/types";

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcEnd(startHHMM: string, blocks: number) {
  const startMin = toMinutes(startHHMM);
  const lesson = 45;
  const breakMin = 10;
  const total = blocks * lesson + Math.max(0, blocks - 1) * breakMin;
  return toHHMM(startMin + total);
}

export default function SetupPage() {
  const router = useRouter();
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

  const slotTimes = useMemo(() => {
    const first = toMinutes("08:30");
    const lastStart = toMinutes("21:20");
    const step = 55;
    const arr: string[] = [];
    for (let t = first; t <= lastStart; t += step) {
      arr.push(toHHMM(t));
    }
    return arr;
  }, []);

  const [courseName, setCourseName] = useState("");
  const [day, setDay] = useState(DAYS[0]);
  const [start, setStart] = useState(slotTimes[0] ?? "08:30");
  const [blocks, setBlocks] = useState(1);
  const [saving, setSaving] = useState(false);
  const [myCourses, setMyCourses] = useState<Course[]>([]);

  const end = useMemo(() => calcEnd(start, blocks), [start, blocks]);

  const loadCourses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setMyCourses(data as Course[]);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSave = async () => {
    // ✅ BURADA: İsmi temizle ve tamamen BÜYÜK HARFE çevir
    const name = courseName.trim().toUpperCase(); 
    
    if (!name) return alert("Ders adı boş olamaz.");

    setSaving(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setSaving(false);
      alert("Lütfen önce giriş yapın.");
      router.push("/login");
      return;
    }

    const payload = {
      id: crypto.randomUUID(),
      user_id: userData.user.id,
      course_name: name, // Artık hep büyük harf gidecek
      day,
      start,
      end,
      blocks,
    };

    const { error } = await supabase.from("courses").insert(payload);

    if (error) {
      setSaving(false);
      return alert("DB hata: " + error.message);
    }

    setCourseName("");
    setBlocks(1);
    setSaving(false);
    loadCourses();
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Bu dersi silmek istediğine emin misin?")) return;

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      loadCourses();
    }
  };

  const field =
    "w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-slate-500 focus:ring-4 focus:ring-slate-100 transition";

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        title="Ders Ekle"
        right={
          <a
            href="/dashboard"
            className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition"
          >
            Bitti
          </a>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-6">
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="text-sm font-bold text-slate-900">Yeni Ders Tanımla</div>
          <div className="mt-1 text-xs text-slate-600">
            İsimler otomatik olarak büyük harfe çevrilir.
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-800">
                Ders Adı
              </label>
              <input
                type="text"
                placeholder="Örn: se116"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className={field}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Gün
                </label>
                <select value={day} onChange={(e) => setDay(e.target.value)} className={field}>
                  {DAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Başlangıç
                </label>
                <select value={start} onChange={(e) => setStart(e.target.value)} className={field}>
                  {slotTimes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Blok
                </label>
                <select value={blocks} onChange={(e) => setBlocks(Number(e.target.value))} className={field}>
                  {[1, 2, 3, 4].map((b) => (
                    <option key={b} value={b}>{b} blok</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Bitiş
                </label>
                <div className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm">
                  <div className="font-bold text-slate-900">{end}</div>
                  <div className="mt-1 text-[11px] text-slate-600">(Otomatik hesaplanır)</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet ve Listeye Ekle"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Programındaki Dersler
            </h3>
            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              {myCourses.length} Ders
            </span>
          </div>

          {myCourses.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs font-medium">
              Henüz ders eklenmedi.
            </div>
          ) : (
            myCourses.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-extrabold text-slate-900">{c.course_name}</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                    {c.day} • {c.start} - {c.end} ({c.blocks} Blok)
                  </span>
                </div>
                <button 
                  onClick={() => c.id && handleDelete(c.id)}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition active:scale-90"
                  title="Dersi Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}