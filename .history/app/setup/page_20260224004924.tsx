"use client";

import { useMemo, useState } from "react";

type Course = {
  courseName: string;
  day: string;
  start: string; // "08:30"
  end: string;   // "10:20"
  blocks: number;
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function SetupPage() {
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

  // Okul slotları: 08:30’dan başlayıp her 55 dk’da bir
  const slotTimes = useMemo(() => {
    const start = toMinutes("08:30");
    const lastStart = toMinutes("19:00"); // bunu istersen değiştiririz
    const step = 55; // 45 + 10

    const arr: string[] = [];
    for (let t = start; t <= lastStart; t += step) arr.push(toHHMM(t));
    return arr;
  }, []);

  const [courseName, setCourseName] = useState("");
  const [day, setDay] = useState(DAYS[0]);
  const [start, setStart] = useState(slotTimes[0] ?? "08:30");
  const [blocks, setBlocks] = useState(1);

  // Bitişi otomatik hesapla: blocks * 55 dk ekle, ama son blokta “mola” saymak ister misin?
  // Basit ve pratik: her blok 55 dk kabul ediyoruz.
  const end = useMemo(() => {
    const startMin = toMinutes(start);
    const total = blocks * 55;
    return toHHMM(startMin + total);
  }, [start, blocks]);

  const handleSave = () => {
    if (!courseName.trim()) {
      alert("Ders adı boş olamaz.");
      return;
    }

    const newCourse: Course = {
      courseName: courseName.trim(),
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
    <div className="flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          Ders Ekle
        </h1>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Ders Adı (ör: SE380)"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
            >
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
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
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
            >
              {[1, 2, 3, 4].map((b) => (
                <option key={b} value={b}>
                  {b} blok
                </option>
              ))}
            </select>

            <div className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-gray-50">
              <span className="text-gray-500">Bitiş:</span>{" "}
              <span className="font-semibold">{end}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-800 transition"
          >
            Kaydet
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Şimdilik kayıtlar sadece bu bilgisayarın tarayıcısında (localStorage)
            tutulur. Daha sonra login + database ile “her cihazdan aynı dersler”
            yapacağız.
          </p>
        </div>
      </div>
    </div>
  );
}