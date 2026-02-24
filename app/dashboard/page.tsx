"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CourseCard from "@/components/CourseCard";
import MissedSheet from "@/components/MissedSheet";
import type { Course } from "@/lib/types";
import { addDays, dayNameTR, prettyTR, todayISO, toMinutes } from "@/lib/date";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetCourse, setSheetCourse] = useState<Course | null>(null);

  // Çıkış İşlemi
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Dersleri Yükle (Sadece giriş yapan kullanıcının dersleri)
  useEffect(() => {
    const loadCourses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id) 
        .order("start", { ascending: true });

      if (!error && data) setCourses(data as Course[]);
    };
    loadCourses();
  }, [router]);

  // Yoklamaları Yükle (Sadece seçili gün ve aktif kullanıcı için)
  useEffect(() => {
    const loadAttendance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("attendance")
        .select("course_id, missed_blocks")
        .eq("user_id", user.id)
        .eq("date", selectedDate);

      if (error || !data) {
        setAttendance({});
        return;
      }

      const map: Record<string, number> = {};
      data.forEach((row) => {
        if (row.course_id) map[row.course_id] = row.missed_blocks;
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

  const missedFor = (c: Course) => (c.id ? (attendance[c.id] ?? 0) : 0);

  const openMissed = (c: Course) => {
    setSheetCourse(c);
    setSheetOpen(true);
  };

  const closeMissed = () => {
    setSheetOpen(false);
    setSheetCourse(null);
  };

  // Yoklama Kaydet/Güncelle
  const setMissedHours = async (hours: number) => {
    if (!sheetCourse || !sheetCourse.id) return;

    const { data: { user } } = await supabase.auth.getUser();
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
      const courseId = String(sheetCourse.id);
      setAttendance((prev) => ({ ...prev, [courseId]: capped }));
    }
    closeMissed();
  };

  // Yoklamayı Sıfırla
  const clearMissed = async (c: Course) => {
    if (!c.id) return;
    const { data: { user } } = await supabase.auth.getUser();
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
      const courseId = String(c.id);
      setAttendance((prev) => ({ ...prev, [courseId]: 0 }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        right={
          <div className="flex gap-2">
            <button onClick={handleLogout} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800">
              Çıkış
            </button>
            <a href="/setup" className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
              + Ders
            </a>
          </div>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4">
        {/* Tarih Seçici */}
        <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-slate-200">
          <button onClick={goPrev} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 font-bold">‹</button>
          <div className="flex flex-col items-center">
            <div className="text-base font-bold text-slate-900">{prettyTR(selectedDate)}</div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:outline-none"
              />
              <button onClick={goToday} disabled={isToday} className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-white disabled:opacity-40">
                Bugün
              </button>
            </div>
          </div>
          <button onClick={goNext} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 font-bold">›</button>
        </div>

        {/* Ders Listesi */}
        <div className="mt-4 space-y-3">
          {todaysCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-900">
              Bugün ders yok
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