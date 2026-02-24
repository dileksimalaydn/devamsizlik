"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function DashboardPage() {
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

  const [courses, setCourses] = useState<Course[]>([]);
  const [filterDay, setFilterDay] = useState<string>("Hepsi");

  useEffect(() => {
    try {
      const existing = localStorage.getItem("courses");
      const parsed: Course[] = existing ? JSON.parse(existing) : [];
      setCourses(parsed);
    } catch (e) {
      console.error(e);
      setCourses([]);
    }
  }, []);

  const filtered = useMemo(() => {
    const list = filterDay === "Hepsi" ? courses : courses.filter((c) => c.day === filterDay);
    // gün içi saat sırası
    return [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [courses, filterDay]);

  const groupedByDay = useMemo(() => {
    const map: Record<string, Course[]> = {};
    for (const d of DAYS) map[d] = [];
    for (const c of filtered) {
      if (!map[c.day]) map[c.day] = [];
      map[c.day].push(c);
    }
    // her günün içini saate göre sırala
    for (const d of Object.keys(map)) {
      map[d].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    }
    return map;
  }, [filtered]);

  const clearAll = () => {
    const ok = confirm("Tüm dersleri silmek istiyor musun?");
    if (!ok) return;
    localStorage.removeItem("courses");
    setCourses([]);
  };

  const removeOne = (idxInAll: number) => {
    const ok = confirm("Bu dersi silmek istiyor musun?");
    if (!ok) return;

    const next = courses.filter((_, i) => i !== idxInAll);
    localStorage.setItem("courses", JSON.stringify(next));
    setCourses(next);
  };

  // “filtered” içindeki elemanların asıl indexini bulmak için (silme butonu)
  const findOriginalIndex = (course: Course) =>
    courses.findIndex(
      (c) =>
        c.courseName === course.courseName &&
        c.day === course.day &&
        c.start === course.start &&
        c.end === course.end &&
        c.blocks === course.blocks
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kaydettiğin dersleri burada görüyoruz. (Şimdilik localStorage)
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="Hepsi">Hepsi</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            onClick={clearAll}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Tümünü Sil
          </button>

          <a
            href="/setup"
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 text-center"
          >
            + Ders Ekle
          </a>
        </div>
      </div>

      {/* boş state */}
      {courses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Henüz ders yok</h2>
          <p className="mt-2 text-sm text-gray-500">
            Setup sayfasından ders ekleyince burada listelenecek.
          </p>
          <a
            href="/setup"
            className="mt-5 inline-block rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Setup’a Git
          </a>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {DAYS.map((day) => (
            <section key={day} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{day}</h2>
                <span className="text-xs text-gray-500">
                  {groupedByDay[day]?.length ?? 0} ders
                </span>
              </div>

              {(!groupedByDay[day] || groupedByDay[day].length === 0) ? (
                <p className="mt-3 text-sm text-gray-500">Bu gün için ders yok.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {groupedByDay[day].map((c) => {
                    const originalIndex = findOriginalIndex(c);

                    return (
                      <div
                        key={`${c.courseName}-${c.day}-${c.start}-${c.end}-${c.blocks}`}
                        className="flex flex-col gap-2 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900">
                            {c.start} – {c.end}
                          </div>

                          <div>
                            <div className="text-base font-semibold text-gray-900">
                              {c.courseName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.blocks} blok • {c.day}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (originalIndex >= 0) removeOne(originalIndex);
                          }}
                          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        >
                          Sil
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500">
        Güvenlik notu: Şu an veriler sadece senin bilgisayarında saklanıyor. İnternete “yayınlama / paylaşma”
        aşamasına geçince login + database + yetkilendirme kuracağız.
      </p>
    </div>
  );
}