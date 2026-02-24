"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CourseCard from "@/components/CourseCard";
import MissedSheet from "@/components/MissedSheet";
import type { Course } from "@/lib/types";
import { addDays, dayNameTR, prettyTR, todayISO, toMinutes } from "@/lib/date";
import { attKey, loadAttendance, loadCourses, saveAttendance } from "@/lib/storage";
import { normalizeCourseName } from "@/lib/normalize";

// Oturum key'i (attendance key'lerinde kullanılan kısım ile aynı mantık)
function sessionKey(c: Course) {
  return c.id ?? `${c.courseName}|${c.day}|${c.start}|${c.end}|${c.blocks}`;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetCourse, setSheetCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourses(loadCourses());
    setAttendance(loadAttendance());
  }, []);

  const selectedDayName = useMemo(() => dayNameTR(selectedDate), [selectedDate]);

  const todaysCourses = useMemo(() => {
    const list = courses.filter((c) => c.day === selectedDayName);
    return [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [courses, selectedDayName]);

  const isToday = selectedDate === todayISO();
  const goPrev = () => setSelectedDate((d) => addDays(d, -1));
  const goNext = () => setSelectedDate((d) => addDays(d, +1));
  const goToday = () => setSelectedDate(todayISO());

  const missedFor = (c: Course) => attendance[attKey(selectedDate, c)] ?? 0;

  const openMissed = (c: Course) => {
    setSheetCourse(c);
    setSheetOpen(true);
  };
  const closeMissed = () => {
    setSheetOpen(false);
    setSheetCourse(null);
  };

  const setMissedHours = (hours: number) => {
    if (!sheetCourse) return;
    const capped = Math.max(0, Math.min(hours, sheetCourse.blocks));
    const key = attKey(selectedDate, sheetCourse);
    const next = { ...attendance, [key]: capped };
    setAttendance(next);
    saveAttendance(next);
    closeMissed();
  };

  const clearMissed = (c: Course) => {
    const key = attKey(selectedDate, c);
    const next = { ...attendance, [key]: 0 };
    setAttendance(next);
    saveAttendance(next);
  };

  const navBtn =
    "grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-800 shadow-sm hover:bg-slate-200 transition active:scale-95";

  // ✅ TOPLAM DEVAMSIZLIK: ders adı normalize ederek grupla
  const totalsByNormalizedName = useMemo(() => {
    // groupKey -> { displayName, missed, sessions }
    const map: Record<
      string,
      { displayName: string; missed: number; sessions: Course[] }
    > = {};

    // önce grupları course list'inden oluştur
    for (const c of courses) {
      const g = normalizeCourseName(c.courseName);
      if (!map[g]) {
        map[g] = { displayName: c.courseName.trim(), missed: 0, sessions: [] };
      }
      map[g].sessions.push(c);
    }

    // sessionKey -> groupKey lookup (hızlı olsun)
    const sessionToGroup: Record<string, string> = {};
    for (const c of courses) {
      sessionToGroup[sessionKey(c)] = normalizeCourseName(c.courseName);
    }

    // attendance topla
    for (const [k, v] of Object.entries(attendance)) {
      const idx = k.indexOf("|");
      if (idx === -1) continue;
      const sk = k.slice(idx + 1); // date|SESSIONKEY kısmından sessionKey'i aldık

      const g = sessionToGroup[sk];
      if (!g) continue;

      if (!map[g]) map[g] = { displayName: sk, missed: 0, sessions: [] };
      map[g].missed += Number(v) || 0;
    }

    return Object.entries(map)
      .map(([groupKey, val]) => ({ groupKey, ...val }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "tr"));
  }, [attendance, courses]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        right={
          <a
            href="/setup"
            className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            + Ders
          </a>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4">
        {/* Date bar */}
        <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-slate-200">
          <button onClick={goPrev} className={navBtn} aria-label="Geri">
            ‹
          </button>

          <div className="flex flex-col items-center">
            <div className="text-base font-bold text-slate-900 tracking-tight">
              {prettyTR(selectedDate)}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-500"
              />

              <button
                onClick={goToday}
                disabled={isToday}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:bg-slate-800 transition"
              >
                Bugün
              </button>
            </div>
          </div>

          <button onClick={goNext} className={navBtn} aria-label="İleri">
            ›
          </button>
        </div>

        {/* Courses today */}
        <div className="mt-4 space-y-3">
          {todaysCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <div className="text-sm font-semibold text-slate-900">Bugün ders yok</div>
              <div className="mt-1 text-xs text-slate-600">
                {selectedDayName} günü için kayıt bulunamadı.
              </div>
              <a
                href="/setup"
                className="mt-4 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Ders Ekle
              </a>
            </div>
          ) : (
            todaysCourses.map((c) => (
              <CourseCard
                key={c.id ?? `${c.courseName}-${c.day}-${c.start}`}
                course={c}
                missed={missedFor(c)}
                onOpenMissed={() => openMissed(c)}
                onClearMissed={() => clearMissed(c)}
              />
            ))
          )}
        </div>

        {/* ✅ Totals by course name (normalize) */}
        {totalsByNormalizedName.length > 0 && (
          <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="text-sm font-bold text-slate-900">Toplam Devamsızlıklar</div>
            <div className="mt-2 text-xs text-slate-600">
              Aynı dersin farklı günlerdeki oturumları tek satırda toplanır.
            </div>

            <div className="mt-3 space-y-2">
              {totalsByNormalizedName.map((g) => (
                <div
                  key={g.groupKey}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{g.displayName}</div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      {g.sessions.length} oturum
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {g.missed} saat
                    </div>
                    <div className="text-xs text-slate-600">devamsızlık</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      <MissedSheet
        open={sheetOpen && !!sheetCourse}
        courseName={sheetCourse?.courseName ?? ""}
        blocks={sheetCourse?.blocks ?? 1}
        onPick={setMissedHours}
        onClose={closeMissed}
      />
    </main>
  );
}