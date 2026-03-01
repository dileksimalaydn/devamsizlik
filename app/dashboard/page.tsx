"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Info } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetCourse, setSheetCourse] = useState<Course | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const loadCourses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      setLoading(false);
    };
    loadCourses();
  }, [router]);

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
  const goNext = () => {
    if (!isToday) setSelectedDate((d) => addDays(d, +1));
  };
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
      const courseId = String(sheetCourse.id);
      setAttendance((prev) => ({ ...prev, [courseId]: capped }));
    }
    closeMissed();
  };

  const clearMissed = async (c: Course) => {
    if (!c.id) return;
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
      const courseId = String(c.id);
      setAttendance((prev) => ({ ...prev, [courseId]: 0 }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        right={
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
            >
              Çıkış
            </button>
            <a
              href="/setup"
              className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 transition-all active:scale-95"
            >
              Ders Ekle +
            </a>
          </div>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4">
        {/* Info hint */}
        <div className="flex items-start gap-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3 mb-4">
          <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-700 leading-relaxed">
  Derse gitmedin mi? <strong className="text-indigo-900">İşaretle</strong> butonuna bas,
  devamsızlığını kaydet. Ok tuşlarıyla geçmiş günlere de gidebilirsin.
  <br />
  Devamsızlığı işaretlemeyi <strong className="text-indigo-900">unuttuysan</strong>,
  <strong className="text-indigo-900">Devamsızlıklar</strong> sayfasından sonradan ekleyebilirsin.
  <br />
  Derslerin görünmüyorsa, önce <strong className="text-indigo-900">Ders Ekle</strong> bölümünden programını oluştur.
</p>
        </div>

        {/* Haftalık program — kompakt link */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => router.push("/weekly")}
            className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
          >
            <CalendarDays size={13} />
            Haftalık Program
          </button>
        </div>

        {/* Tarih Seçici */}
        <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-slate-200">
          <button
            onClick={goPrev}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
          >
            ‹
          </button>

          <div className="flex flex-col items-center">
            <div className="text-base font-extrabold text-slate-900">
              {prettyTR(selectedDate)}
            </div>
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
            disabled={isToday}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>

        {/* Ders Listesi */}
        <div className="mt-4 space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-2 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                    <div className="h-3 w-1/3 rounded-full bg-slate-100" />
                    <div className="h-3 w-1/4 rounded-full bg-slate-100" />
                  </div>
                  <div className="h-9 w-16 rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))
          ) : todaysCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <div className="text-sm font-semibold text-slate-700">
                Bugün ders yok
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Dinlenme günü, tadını çıkar.
              </div>
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