"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CourseCard from "@/components/CourseCard";
import MissedSheet from "@/components/MissedSheet";
import type { Course } from "@/lib/types";
import { addDays, dayNameTR, prettyTR, todayISO, toMinutes } from "@/lib/date";
import { normalizeCourseName } from "@/lib/normalize";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetCourse, setSheetCourse] = useState<Course | null>(null);

  // 🔹 LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 🔹 COURSES LOAD (RLS user scoped)
  useEffect(() => {
    const loadCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("start", { ascending: true });

      if (!error && data) setCourses(data as Course[]);
    };

    loadCourses();
  }, []);

  // 🔹 ATTENDANCE LOAD (user + date scoped)
  useEffect(() => {
    const loadAttendance = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("attendance")
        .select("course_id, missed_blocks")
        .eq("user_id", user.id)
        .eq("date", selectedDate);

      if (error || !data) return;

      const map: Record<string, number> = {};
      data.forEach((row: any) => {
        map[row.course_id] = row.missed_blocks ?? 0;
      });

      setAttendance(map);
    };

    loadAttendance();
  }, [selectedDate]);

  const selectedDayName = useMemo(() => dayNameTR(selectedDate), [selectedDate]);

  const todaysCourses = useMemo(() => {
    return courses
      .filter((c) => c.day === selectedDayName)
      .slice()
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [courses, selectedDayName]);

  const isToday = selectedDate === todayISO();
  const goPrev = () => setSelectedDate((d) => addDays(d, -1));
  const goNext = () => setSelectedDate((d) => addDays(d, +1));
  const goToday = () => setSelectedDate(todayISO());

  const missedFor = (c: Course) => attendance[c.id] ?? 0;

  const openMissed = (c: Course) => {
    setSheetCourse(c);
    setSheetOpen(true);
  };

  const closeMissed = () => {
    setSheetOpen(false);
    setSheetCourse(null);
  };

  // 🔹 ATTENDANCE UPSERT
  const setMissedHours = async (hours: number) => {
    if (!sheetCourse) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const capped = Math.max(0, Math.min(hours, sheetCourse.blocks));

    const { error } = await supabase.from("attendance").upsert(
      {
        user_id: user.id,
        course_id: sheetCourse.id,
        date: selectedDate,
        missed_blocks: capped,
      },
      { onConflict: "user_id,course_id,date" }
    );

    if (!error) {
      setAttendance((prev) => ({
        ...prev,
        [sheetCourse.id]: capped,
      }));
    }

    closeMissed();
  };

  const clearMissed = async (c: Course) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("attendance").upsert(
      {
        user_id: user.id,
        course_id: c.id,
        date: selectedDate,
        missed_blocks: 0,
      },
      { onConflict: "user_id,course_id,date" }
    );

    if (!error) {
      setAttendance((prev) => ({
        ...prev,
        [c.id]: 0,
      }));
    }
  };

  // 🔹 SUMMARY (normalize ile grupla)
  const totalsByNormalizedName = useMemo(() => {
    const map: Record<
      string,
      { displayName: string; missed: number; sessions: Course[] }
    > = {};

    for (const c of courses) {
      const g = normalizeCourseName(c.course_name);

      if (!map[g]) {
        map[g] = {
          displayName: c.course_name.trim(),
          missed: 0,
          sessions: [],
        };
      }

      map[g].sessions.push(c);
      map[g].missed += attendance[c.id] ?? 0;
    }

    return Object.entries(map)
      .map(([groupKey, val]) => ({ groupKey, ...val }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "tr"));
  }, [attendance, courses]);

  const navBtn =
    "grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-800 shadow-sm hover:bg-slate-200 transition active:scale-95";

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        right={
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
            >
              Çıkış
            </button>

            <a
              href="/setup"
              className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              + Ders
            </a>
          </div>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4">
        {/* Date bar */}
        <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-slate-200">
          <button onClick={goPrev} className={navBtn} aria-label="Geri">
            ‹
          </button>

          <div className="flex flex-col items-center">
            <div className="text-base font-bold text-slate-900">
              {prettyTR(selectedDate)}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium"
              />

              <button
                onClick={goToday}
                disabled={isToday}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
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
              <div className="text-sm font-semibold text-slate-900">
                Bugün ders yok
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {selectedDayName} günü için kayıt bulunamadı.
              </div>
              <a
                href="/setup"
                className="mt-4 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Ders Ekle
              </a>
            </div>
          ) : (
            todaysCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                missed={missedFor(c)}
                onOpenMissed={() => openMissed(c)}
                onClearMissed={() => clearMissed(c)}
              />
            ))
          )}
        </div>

        {/* Totals */}
        {totalsByNormalizedName.length > 0 && (
          <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="text-sm font-bold text-slate-900">
              Toplam Devamsızlıklar
            </div>

            <div className="mt-3 space-y-2">
              {totalsByNormalizedName.map((g) => (
                <div
                  key={g.groupKey}
                  className="flex items-center justify-between rounded-2xl border px-3 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold">{g.displayName}</div>
                    <div className="text-xs text-slate-600">
                      {g.sessions.length} oturum
                    </div>
                  </div>

                  <div className="text-sm font-bold">{g.missed} saat</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      <MissedSheet
        open={sheetOpen && !!sheetCourse}
        courseName={sheetCourse?.course_name ?? ""}
        blocks={sheetCourse?.blocks ?? 1}
        onPick={setMissedHours}
        onClose={closeMissed}
      />
    </main>
  );
}