"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFeatureNotif, setShowFeatureNotif] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("hosgeldin")) {
      setShowWelcome(true);
      localStorage.removeItem("hosgeldin");
    } else if (!localStorage.getItem("school_feature_v1")) {
      setShowFeatureNotif(true);
    }
  }, []);

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

        {/* Eski kullanıcı — bir kerelik okul özelliği bildirimi */}
        {showFeatureNotif && (
          <div className="flex items-start justify-between gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 mb-3">
            <p className="text-sm text-amber-800">
              Artık üniversiteni <a href="/settings" className="underline font-semibold">Ayarlar</a>'dan istediğin zaman değiştirebilirsin.
            </p>
            <button onClick={() => { setShowFeatureNotif(false); localStorage.setItem("school_feature_v1", "1"); }} className="shrink-0 text-amber-400 hover:text-amber-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Hoş geldin banner — ilk Google girişi */}
        {showWelcome && (
          <div className="flex items-start justify-between gap-3 rounded-3xl border border-indigo-200 bg-indigo-50 px-4 py-3 mb-3">
            <p className="text-sm text-indigo-800">
              <strong>Hoş geldin!</strong> Üniversiten <strong>IEU</strong> olarak ayarlandı. Farklıysa{" "}
              <a href="/settings" className="underline font-semibold">Ayarlar</a>'dan değiştirebilirsin.
            </p>
            <button onClick={() => setShowWelcome(false)} className="shrink-0 text-indigo-400 hover:text-indigo-600">
              <X size={16} />
            </button>
          </div>
        )}

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
        <div className="rounded-3xl bg-white px-4 py-4 shadow-sm border border-slate-200">
          {/* Üst satır: ok + tarih + ok */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              className="flex items-center gap-1 rounded-2xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <ChevronLeft size={14} /> Önceki
            </button>

            <div className="text-center">
              <div className="text-base font-extrabold text-slate-900">
                {prettyTR(selectedDate)}
              </div>
              {!isToday && (
                <button
                  onClick={goToday}
                  className="mt-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Bugüne dön
                </button>
              )}
            </div>

            <button
              onClick={goNext}
              disabled={isToday}
              className="flex items-center gap-1 rounded-2xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Sonraki <ChevronRight size={14} />
            </button>
          </div>

          {/* Son 7 gün hızlı seçim */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(todayISO(), -i);
              const isSelected = d === selectedDate;
              const label = i === 0 ? "Bugün" : i === 1 ? "Dün" : dayNameTR(d).slice(0, 3);
              const num = d.slice(8); // gün numarası
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`flex shrink-0 flex-col items-center rounded-2xl px-3 py-2 transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] font-semibold">{label}</span>
                  <span className="text-sm font-extrabold">{num}</span>
                </button>
              );
            })}
          </div>
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