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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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

  const handleDeleteCourse = async (courseId: string | number) => {
    const confirmDelete = confirm("Bu dersi ve bu derse ait tüm yoklama geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.");
    
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      alert("Ders silinirken bir hata oluştu: " + error.message);
    } else {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  };

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
            <button onClick={handleLogout} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-colors">
              Çıkış
            </button>
            <a href="/setup" className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 transition-all active:scale-95">
              Ders Ekle +
            </a>
          </div>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4">
        
        {/* Haftalık Program Butonu */}
        <button 
          onClick={() => router.push('/weekly')}
          className="w-full mb-6 p-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 h-10 w-10 rounded-2xl flex items-center justify-center text-lg">
              📅
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900">Weekly Schedule</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">View Full Grid</div>
            </div>
          </div>
          <span className="text-slate-300 group-hover:text-slate-900 transition-colors pr-2">›</span>
        </button>

        {/* Tarih Seçici */}
        <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-slate-200">
          <button 
            onClick={goPrev} 
            className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-200 text-slate-900 font-bold hover:bg-slate-300 transition-colors"
          >
            ‹
          </button>
          
          <div className="flex flex-col items-center">
            <div className="text-base font-extrabold text-slate-900">{prettyTR(selectedDate)}</div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-400 px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <button 
                onClick={goToday} 
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-30 transition-all"
                disabled={isToday}
              >
                {isToday ? "Bugün" : "Bugüne Dön"}
              </button>
            </div>
          </div>
          
          <button 
            onClick={goNext} 
            className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-200 text-slate-900 font-bold hover:bg-slate-300 transition-colors"
          >
            ›
          </button>
        </div>

        {/* Ders Listesi */}
        <div className="mt-4 space-y-3">
          {todaysCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-900">
              Bugün ders yok 🥳✨
            </div>
          ) : (
            todaysCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                missed={missedFor(c)}
                onOpenMissed={() => openMissed(c)}
                onClearMissed={() => clearMissed(c)}
                onDelete={() => c.id && handleDeleteCourse(c.id)}
              />
            ))
          )}
        </div>

        {/* İmza */}
        <div className="mt-12 pb-8 text-center">
          <p className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase opacity-70">
            Developed by Dilek Şimal Aydın
          </p>
          <div className="mt-2 mx-auto h-[1px] w-6 bg-slate-300" />
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