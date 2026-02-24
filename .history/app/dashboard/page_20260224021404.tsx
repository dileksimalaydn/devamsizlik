"use client";

import { useEffect, useMemo, useState } from "react";

type Course = {
  id?: string;
  courseName: string;
  day: string; // "Pazartesi"...
  start: string; // "08:30"
  end: string; // "10:20"
  blocks: number; // 1,2,3...
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function dayNameTR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const map = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return map[d.getDay()];
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateStr: string, amount: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + amount);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// basit TR format: "2026-02-24" -> "Salı, 24 Şubat"
function prettyTR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const fmt = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "2-digit", month: "long" });
  const s = fmt.format(d);
  // "24 Şubat Salı" gibi gelebilir; biz "Salı, 24 Şubat" istiyoruz:
  // garanti değil ama çoğu cihazda zaten "24 Şubat Salı" / "Salı 24 Şubat" değişir.
  // Basitçe: weekday'i ayrıca alıp birleştirelim:
  const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(d);
  const dm = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long" }).format(d);
  return `${capitalizeTR(weekday)}, ${dm}`;
}

function capitalizeTR(s: string) {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
}

const LS_COURSES = "courses";
const LS_ATT = "attendance_v1";

// Attendance key: date|courseKey -> missedHours(number)
function courseKey(c: Course) {
  return c.id ?? `${c.courseName}|${c.day}|${c.start}|${c.end}|${c.blocks}`;
}
function attKey(dateISO: string, c: Course) {
  return `${dateISO}|${courseKey(c)}`;
}

type AttendanceMap = Record<string, number>;

function loadAttendance(): AttendanceMap {
  try {
    const raw = localStorage.getItem(LS_ATT);
    return raw ? (JSON.parse(raw) as AttendanceMap) : {};
  } catch {
    return {};
  }
}
function saveAttendance(map: AttendanceMap) {
  localStorage.setItem(LS_ATT, JSON.stringify(map));
}

// basit renk havuzu (ders adına göre sabit)
function colorFor(courseName: string) {
  const palette = [
    { card: "bg-rose-500", pill: "bg-rose-600", soft: "bg-rose-50", bar: "bg-rose-500" },
    { card: "bg-sky-500", pill: "bg-sky-600", soft: "bg-sky-50", bar: "bg-sky-500" },
    { card: "bg-amber-500", pill: "bg-amber-600", soft: "bg-amber-50", bar: "bg-amber-500" },
    { card: "bg-emerald-500", pill: "bg-emerald-600", soft: "bg-emerald-50", bar: "bg-emerald-500" },
    { card: "bg-violet-500", pill: "bg-violet-600", soft: "bg-violet-50", bar: "bg-violet-500" },
  ];

  let hash = 0;
  for (let i = 0; i < courseName.length; i++) hash = (hash * 31 + courseName.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

// MVP: her ders için “izinli devamsızlık” varsayımı (sonra ayarlarız)
const DEFAULT_ALLOWED_HOURS = 12;

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [attendance, setAttendance] = useState<AttendanceMap>({});

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<Course | null>(null);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(LS_COURSES);
      const parsed: Course[] = existing ? JSON.parse(existing) : [];
      setCourses(parsed);
    } catch {
      setCourses([]);
    }

    setAttendance(loadAttendance());
  }, []);

  const selectedDayName = useMemo(() => dayNameTR(selectedDate), [selectedDate]);

  const todaysCourses = useMemo(() => {
    const list = courses.filter((c) => c.day === selectedDayName);
    return [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [courses, selectedDayName]);

  const goPrev = () => setSelectedDate((d) => addDays(d, -1));
  const goNext = () => setSelectedDate((d) => addDays(d, +1));
  const goToday = () => setSelectedDate(todayISO());

  // bugün seçili mi
  const isToday = selectedDate === todayISO();

  // bugünkü dersin missed saatini oku
  const missedToday = (c: Course) => {
    const k = attKey(selectedDate, c);
    return attendance[k] ?? 0;
  };

  // GELDİM = missed 0
  const markPresent = (c: Course) => {
    const next = { ...attendance, [attKey(selectedDate, c)]: 0 };
    setAttendance(next);
    saveAttendance(next);
  };

  // GELMEDİM tıkla -> modal aç
  const openMissedModal = (c: Course) => {
    setModalCourse(c);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalCourse(null);
  };

  const setMissedHours = (hours: number) => {
    if (!modalCourse) return;
    const capped = Math.max(0, Math.min(hours, modalCourse.blocks)); // blocks kadar max
    const next = { ...attendance, [attKey(selectedDate, modalCourse)]: capped };
    setAttendance(next);
    saveAttendance(next);
    closeModal();
  };

  // Toplam devamsızlık: tüm tarihler üzerinden courseKey bazlı topla
  const totalsByCourse = useMemo(() => {
    const totals: Record<string, { course: Course; missed: number }> = {};

    for (const c of courses) {
      totals[courseKey(c)] = { course: c, missed: 0 };
    }

    for (const [k, v] of Object.entries(attendance)) {
      // k = "YYYY-MM-DD|courseKey"
      const idx = k.indexOf("|");
      if (idx === -1) continue;
      const ck = k.slice(idx + 1);
      if (!totals[ck]) continue;
      totals[ck].missed += Number(v) || 0;
    }

    return Object.values(totals).sort((a, b) =>
      a.course.courseName.localeCompare(b.course.courseName, "tr")
    );
  }, [attendance, courses]);

  return (
    <main className="min-h-screen bg-slate-100">
      {/* App bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
              🎓
            </div>
            <div className="text-base font-semibold">Okul Yoklama</div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/setup"
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
            >
              + Ders
            </a>
            <div className="h-9 w-9 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* Phone container */}
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">
        {/* Date row */}
        <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm">
          <button
            onClick={goPrev}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-lg hover:bg-slate-200"
            aria-label="Geri"
          >
            ‹
          </button>

          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-slate-900">{prettyTR(selectedDate)}</div>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
              />
              <button
                onClick={goToday}
                disabled={isToday}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Bugün
              </button>
            </div>
          </div>

          <button
            onClick={goNext}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-lg hover:bg-slate-200"
            aria-label="İleri"
          >
            ›
          </button>
        </div>

        {/* Today courses */}
        <div className="mt-4 space-y-3">
          {todaysCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <div className="text-sm font-semibold text-slate-900">Bugün ders yok</div>
              <div className="mt-1 text-xs text-slate-500">
                {selectedDayName} günü için kayıt bulunamadı.
              </div>
              <a
                href="/setup"
                className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Ders Ekle
              </a>
            </div>
          ) : (
            todaysCourses.map((c) => {
              const palette = colorFor(c.courseName);
              const missed = missedToday(c);
              const came = missed === 0;
              const statusText = came ? "GELDİM" : "GELMEDİM";

              return (
                <div
                  key={courseKey(c)}
                  className={`relative overflow-hidden rounded-2xl ${palette.card} p-4 text-white shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-bold">
                        {c.courseName} - {c.blocks}
                      </div>
                      <div className="mt-1 text-sm text-white/90">
                        {c.start} – {c.end}
                      </div>
                    </div>

                    {/* Action pill */}
                    {came ? (
                      <button
                        onClick={() => markPresent(c)}
                        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700"
                        title="Bugün geldim"
                      >
                        GELDİM <span className="grid h-5 w-5 place-items-center rounded-lg bg-emerald-100">✓</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => openMissedModal(c)}
                        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-rose-700"
                        title="Bugün gelmedim"
                      >
                        GELMEDİM <span className="text-base leading-none">›</span>
                      </button>
                    )}
                  </div>

                  {/* mini footer */}
                  <div className="mt-3 flex items-center justify-between text-xs text-white/85">
                    <span>{c.day}</span>
                    <span>
                      {missed > 0 ? `${missed} saat gelmedin` : "Devamsızlık yok"}
                    </span>
                  </div>

                  {/* quick toggle row (optional) */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => markPresent(c)}
                      className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold ${
                        came ? "bg-white text-slate-900" : "bg-white/15 text-white hover:bg-white/20"
                      }`}
                    >
                      Geldim
                    </button>
                    <button
                      onClick={() => openMissedModal(c)}
                      className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold ${
                        !came ? "bg-white text-slate-900" : "bg-white/15 text-white hover:bg-white/20"
                      }`}
                    >
                      Gelmedim
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals */}
        {courses.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-sm font-bold text-slate-900">Toplam Devamsızlıklar</div>

            <div className="mt-3 space-y-3">
              {totalsByCourse.map(({ course, missed }) => {
                const palette = colorFor(course.courseName);
                const allowed = DEFAULT_ALLOWED_HOURS; // şimdilik sabit
                const remaining = Math.max(0, allowed - missed);
                const pct = Math.min(100, Math.round((missed / allowed) * 100));

                return (
                  <div key={courseKey(course)} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-900">
                        {course.courseName} - {course.blocks}
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-rose-600">-{missed} saat</span>{" "}
                        <span>/ {remaining} saat kaldı</span>
                      </div>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-2 ${palette.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-[11px] text-slate-400">
              Not: “kaldı” hesabı şimdilik her ders için {DEFAULT_ALLOWED_HOURS} saat üzerinden.
              Sonra ders bazlı limit ekleyeceğiz.
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav (UI only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-md grid-cols-3 px-6 py-3 text-xs">
          <a href="/dashboard" className="flex flex-col items-center gap-1 font-semibold text-slate-900">
            <div className="text-lg">🏠</div>
            Bugün
          </a>
          <a href="#" className="flex flex-col items-center gap-1 text-slate-500">
            <div className="text-lg">📊</div>
            Devamsızlıklar
          </a>
          <a href="/setup" className="flex flex-col items-center gap-1 text-slate-500">
            <div className="text-lg">📚</div>
            Dersler
          </a>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && modalCourse && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-xl">
            <div className="text-center">
              <div className="text-base font-bold text-slate-900">Kaç saat gelmedin?</div>
              <div className="mt-1 text-xs text-slate-500">
                <span className="font-semibold">{modalCourse.courseName}</span> dersinden bugün kaç saat gelmedin?
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => setMissedHours(1)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                1 saat
              </button>
              <button
                onClick={() => setMissedHours(2)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                2 saat
              </button>
              <button
                onClick={() => setMissedHours(modalCourse.blocks)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Tamamı
              </button>
            </div>

            <button
              onClick={closeModal}
              className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </main>
  );
}