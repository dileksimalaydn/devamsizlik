"use client";

import { useEffect, useMemo, useState } from "react";

type Course = {
  id?: string; // setup sayfasında id eklediysek desteklesin diye opsiyonel
  courseName: string;
  day: string; // "Pazartesi"...
  start: string; // "08:30"
  end: string; // "10:20"
  blocks: number;
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// dateStr: "2026-02-24" -> "Pazartesi"
function dayNameTR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const map = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return map[d.getDay()];
}

// bugün için YYYY-MM-DD
function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// dateStr + N gün (YYYY-MM-DD döndürür)
function addDays(dateStr: string, amount: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + amount);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

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

  const selectedDayName = useMemo(() => dayNameTR(selectedDate), [selectedDate]);

  const todaysCourses = useMemo(() => {
    const list = courses.filter((c) => c.day === selectedDayName);
    return [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [courses, selectedDayName]);

  const clearAll = () => {
    const ok = confirm("Tüm dersleri silmek istiyor musun?");
    if (!ok) return;
    localStorage.removeItem("courses");
    setCourses([]);
  };

  // kayıt silme: id varsa id ile, yoksa (eski kayıtlar) alanlara göre
  const removeCourse = (target: Course) => {
    const ok = confirm("Bu dersi silmek istiyor musun?");
    if (!ok) return;

    const next = courses.filter((c) => {
      if (target.id && c.id) return c.id !== target.id;
      return !(
        c.courseName === target.courseName &&
        c.day === target.day &&
        c.start === target.start &&
        c.end === target.end &&
        c.blocks === target.blocks
      );
    });

    localStorage.setItem("courses", JSON.stringify(next));
    setCourses(next);
  };

  // ✅ OKLAR: 1 gün geri / 1 gün ileri
  const goPrev = () => setSelectedDate((d) => addDays(d, -1));
  const goNext = () => setSelectedDate((d) => addDays(d, +1));

  // ✅ BUGÜNE DÖN
  const goToday = () => setSelectedDate(todayISO());

  const isToday = selectedDate === todayISO();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Üst bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Yoklama</h1>
            <p className="mt-1 text-sm text-gray-500">
              Takvimden gün seç → o günün dersleri gelsin. (Şimdilik localStorage)
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Takvim (sağ üst) */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2">
              <span className="text-sm text-gray-600">Tarih:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm outline-none"
              />
            </div>

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

        {/* Seçilen gün başlığı */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* SOL: oklar + gün bilgisi */}
            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                className="h-9 w-9 rounded-xl border border-gray-200 bg-white text-lg hover:bg-gray-50"
                aria-label="Bir gün geri"
              >
                ◀
              </button>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedDayName}</h2>
                <p className="text-sm text-gray-500">
                  {selectedDate} • {todaysCourses.length} ders
                </p>
              </div>

              <button
                onClick={goNext}
                className="h-9 w-9 rounded-xl border border-gray-200 bg-white text-lg hover:bg-gray-50"
                aria-label="Bir gün ileri"
              >
                ▶
              </button>

              {/* ✅ Bugüne Dön */}
              <button
                onClick={goToday}
                disabled={isToday}
                className="ml-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
              >
                Bugüne Dön
              </button>
            </div>

            {/* SAĞ: düzenle */}
            <a
              href="/setup"
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 text-center"
            >
              Dersleri Düzenle
            </a>
          </div>

          {/* içerik */}
          {courses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <h3 className="text-base font-semibold text-gray-900">Henüz ders yok</h3>
              <p className="mt-2 text-sm text-gray-600">
                Setup sayfasından ders ekleyince burada göreceğiz.
              </p>
              <a
                href="/setup"
                className="mt-4 inline-block rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Setup’a Git
              </a>
            </div>
          ) : todaysCourses.length === 0 ? (
            <p className="mt-6 text-sm text-gray-600">Bu gün için ders yok.</p>
          ) : (
            <div className="mt-6 grid gap-3">
              {todaysCourses.map((c) => (
                <div
                  key={c.id ?? `${c.courseName}-${c.day}-${c.start}-${c.end}-${c.blocks}`}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900">
                      {c.start} – {c.end}
                    </div>

                    <div>
                      <div className="text-base font-semibold text-gray-900">{c.courseName}</div>
                      <div className="text-xs text-gray-500">
                        {c.blocks} blok • {c.day}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeCourse(c)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Güvenlik notu: Şu an veriler sadece bu cihazın tarayıcısında saklanıyor (localStorage).
          İnternete açma aşamasında login + database + yetkilendirme kuracağız.
        </p>
      </div>
    </main>
  );
}