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

  // İEÜ Timetable slotları (senin attığın örneğe göre)
  const slotTimes = useMemo(
    () => [
      "08:30",
      "09:25",
      "10:20",
      "11:15",
      "12:10",
      "13:05",
      "14:00",
      "14:55",
      "15:50",
      "16:45",
      "17:40",
      "18:35",
      "19:30",
      "20:25",
      "21:20",
      "22:15",
      "23:10",
    ],
    []
  );

  const [courseName, setCourseName] = useState("");
  const [day, setDay] = useState(DAYS[0]);
  const [start, setStart] = useState(slotTimes[0]);
  const [blocks, setBlocks] = useState(1);

  // Senin kuralın:
  // 1 blok = 45 dk
  // Bloklar arası mola = 10 dk (yani blocks-1 kadar mola)
  const end = useMemo(() => {
    const startMin = toMinutes(start);
    const totalMinutes = blocks * 45 + (blocks - 1) * 10;
    return toHHMM(startMin + totalMinutes);
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

    try {
      const existing = localStorage.getItem("courses");
      const courses: Course[] = existing ? JSON.parse(existing) : [];

      courses.push(newCourse);
      localStorage.setItem("courses", JSON.stringify(courses));

      setCourseName("");
      setBlocks(1);

      alert("Ders kaydedildi ✅");
    } catch (e) {
      console.error(e);
      alert("Kaydetmede hata oldu (localStorage).");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Ders Ekle
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Ders adı + gün + başlangıç slotu + kaç blok seç → bitiş otomatik çıkar.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Ders Adı (ör: SE380)"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-gray-500">Gün</span>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-400"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs text-gray-500">Başlangıç</span>
              <select
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-400"
              >
                {slotTimes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-gray-500">Kaç blok?</span>
              <select
                value={blocks}
                onChange={(e) => setBlocks(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-400"
              >
                {[1, 2, 3, 4].map((b) => (
                  <option key={b} value={b}>
                    {b} blok
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1">
              <span className="text-xs text-gray-500">Bitiş</span>
              <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                <span className="text-gray-500">Bitiş:</span>{" "}
                <span className="font-semibold text-gray-900">{end}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Kaydet
          </button>

          <p className="mt-2 text-xs text-gray-500">
            Şimdilik kayıtlar sadece bu bilgisayarın tarayıcısında (localStorage)
            tutulur. Daha sonra login + database ile her cihazdan aynı dersler
            yapılacak.
          </p>
        </div>
      </div>
    </div>
  );
}