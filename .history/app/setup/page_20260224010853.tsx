"use client";

import { useMemo, useState } from "react";

type Course = {
  id: string;
  courseName: string;
  day: string;          // Pazartesi...
  start: string;        // "08:30"
  end: string;          // otomatik
  blocks: number;       // 1..4
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

  // 1 blok: 45
  // 2 blok: 45 + 10 + 45
  // 3 blok: 45 + 10 + 45 + 10 + 45 ...
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
    const lastStart = toMinutes("21:20"); // istersen değiştiririz
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
    alert("Ders kaydedildi ✅");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Ders Ekle
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ders adı + gün + başlangıç saati + kaç blok (45dk) seç.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Ders Adı (ör: CE342-1 / SE116-1)"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-900"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-900"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-900"
            >
              {slotTimes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={blocks}
              onChange={(e) => setBlocks(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-900"
            >
              {[1, 2, 3, 4].map((b) => (
                <option key={b} value={b}>
                  {b} blok
                </option>
              ))}
            </select>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
              <span className="text-gray-500">Bitiş:</span>{" "}
              <span className="font-semibold text-gray-900">{end}</span>
              <div className="text-xs text-gray-500 mt-1">
                (45dk/blok, arada 10dk mola)
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Kaydet
          </button>

          <p className="mt-2 text-xs text-gray-500">
            Şimdilik kayıtlar sadece bu bilgisayarda (localStorage). Güvenlik:
            burada şifre/kişisel veri tutmuyoruz. Login + DB gelince “her cihazdan aynı” olacak.
          </p>
        </div>
      </div>
    </main>
  );
}