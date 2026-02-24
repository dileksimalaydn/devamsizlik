"use client";

import { useMemo, useState } from "react";

type Course = {
  id: string;
  courseName: string;
  day: string; // Pazartesi...
  start: string; // "08:30"
  end: string; // otomatik
  blocks: number; // 1..4
};

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
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

  // Ders başlangıç slotları: 08:30’dan itibaren her 55 dk’da bir (45+10)
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
    if (!name) {
      alert("Ders adı boş olamaz.");
      return;
    }

    const newCourse: Course = {
      id: uid(),
      courseName: name,
      day,
      start,
      end,
      blocks,
    };

    const existing = localStorage.getItem("courses");
    const courses: Course[] = existing ? JSON.parse(existing) : [];

    courses.push(newCourse);
    localStorage.setItem("courses", JSON.stringify(courses));

    setCourseName("");
    setBlocks(1);

    // küçük UX: kaydedince dashboard'a dön
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen bg-slate-100">
      {/* App bar (dashboard ile aynı) */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">🎓</div>
            <div className="text-base font-semibold">Okul Yoklama</div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
            >
              Bugün
            </a>
            <div className="h-9 w-9 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* Phone container */}
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm font-bold text-slate-900">Dersler</div>
          <div className="mt-1 text-xs text-slate-500">
            Ders adı + gün + başlangıç saati + blok seçerek programını oluştur.
          </div>
        </div>

        {/* Form card */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm font-bold text-slate-900">Ders Ekle</div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Ders Adı</label>
              <input
                type="text"
                placeholder="Örn: CE342-1 / SE116-1"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Gün</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
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
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                  <div className="font-semibold text-slate-900">{end}</div>
                  <div className="mt-1 text-[11px] text-slate-500">(45dk/blok, arada 10dk mola)</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Kaydet
            </button>

            <p className="text-[11px] text-slate-400">
              Şimdilik kayıtlar sadece bu cihazda (localStorage). Login + DB gelince her cihazdan aynı olacak.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom nav (dashboard ile uyumlu) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-md grid-cols-3 px-6 py-3 text-xs">
          <a href="/dashboard" className="flex flex-col items-center gap-1 text-slate-500">
            <div className="text-lg">🏠</div>
            Bugün
          </a>
          <a href="#" className="flex flex-col items-center gap-1 text-slate-500">
            <div className="text-lg">📊</div>
            Devamsızlıklar
          </a>
          <a href="/setup" className="flex flex-col items-center gap-1 font-semibold text-slate-900">
            <div className="text-lg">📚</div>
            Dersler
          </a>
        </div>
      </div>
    </main>
  );
}