"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import type { Course } from "@/lib/types";
import { loadCourses, saveCourses } from "@/lib/storage";

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
function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function SetupPage() {
  const router = useRouter();
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

  const slotTimes = useMemo(() => {
    const first = toMinutes("08:30");
    const lastStart = toMinutes("21:20");
    const step = 55;
    const arr: string[] = [];
    for (let t = first; t <= lastStart; t += step) arr.push(toHHMM(t));
    return arr;
  }, []);

  const [courseName, setCourseName] = useState("");
  const [day, setDay] = useState(DAYS[0]);
  const [start, setStart] = useState(slotTimes[0] ?? "08:30");
  const [blocks, setBlocks] = useState(1);

  const end = useMemo(() => calcEnd(start, blocks), [start, blocks]);

  const handleSave = () => {
    const name = courseName.trim();
    if (!name) return alert("Ders adı boş olamaz.");

    const newCourse: Course = { id: uid(), courseName: name, day, start, end, blocks };
    const courses = loadCourses();
    courses.push(newCourse);
    saveCourses(courses);

    setCourseName("");
    setBlocks(1);

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        title="Dersler"
        right={
          <a href="/dashboard" className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
            Bugün
          </a>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="text-sm font-bold text-slate-900">Ders Ekle</div>
          <div className="mt-1 text-xs text-slate-500">Ders adı + gün + başlangıç saati + blok seç.</div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Ders Adı</label>
              <input
                type="text"
                placeholder="Örn: CE342-1 / SE116-1"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Gün</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Başlangıç</label>
                <select
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                >
                  {slotTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Blok</label>
                <select
                  value={blocks}
                  onChange={(e) => setBlocks(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                >
                  {[1, 2, 3, 4].map((b) => (
                    <option key={b} value={b}>
                      {b} blok
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Bitiş</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                  <div className="font-semibold text-slate-900">{end}</div>
                  <div className="mt-1 text-[11px] text-slate-500">(45dk/blok, arada 10dk mola)</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white"
            >
              Kaydet
            </button>

            <p className="text-[11px] text-slate-400">
              Şimdilik localStorage. Sonra login + DB gelince her cihazdan aynı olacak.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}