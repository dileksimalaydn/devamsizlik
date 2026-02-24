"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CourseCard from "@/components/CourseCard";
import MissedSheet from "@/components/MissedSheet";
import type { Course } from "@/lib/types";
import { addDays, dayNameTR, prettyTR, todayISO, toMinutes } from "@/lib/date";
import { attKey, loadAttendance, loadCourses, saveAttendance } from "@/lib/storage";

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

  // siyah, net ok butonları
  const navBtn =
    "grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white text-lg font-bold shadow hover:scale-105 transition active:scale-95";

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
        <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-md border border-slate-200">
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
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
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

        {/* Courses */}
        <div className="mt-4 space-y-3">
          {todaysCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <div className="text-sm font-semibold text-slate-900">
                Bugün ders yok
              </div>
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