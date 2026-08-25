"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/lib/types";
import { colorFor } from "@/lib/colors";
import { isIEU } from "@/lib/schools";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const TIME_SLOTS = ["08:30", "09:25", "10:20", "11:15", "12:10", "13:05", "14:00", "14:55", "15:50", "16:45", "17:40", "18:35", "19:30", "20:25", "21:20"];

export default function WeeklyPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [school, setSchool] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/login");
      const { data: profile } = await supabase
        .from("profiles")
        .select("school")
        .eq("user_id", user.id)
        .single();
      setSchool(profile?.school ?? "ieu");
      const { data, error } = await supabase.from("courses").select("*").eq("user_id", user.id);
      if (!error && data) setCourses(data as Course[]);
    };
    load();
  }, [router]);

  const getCourseForCell = (day: string, time: string) => {
    return courses.find(c => {
      if (c.day !== day) return false;
      const startIdx = TIME_SLOTS.indexOf(c.start);
      const currentIdx = TIME_SLOTS.indexOf(time);
      return currentIdx >= startIdx && currentIdx < startIdx + c.blocks;
    });
  };

  if (school === null) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <AppHeader
        left={<button onClick={() => router.push('/dashboard')} className="p-2 text-2xl">‹</button>}
      />

      {isIEU(school) ? (
        /* IEU: Orijinal grid görünümü */
        <div className="p-2 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse border border-border shadow-sm">
            <thead>
              <tr className="bg-card text-foreground">
                <th className="p-2 border border-border text-[10px] uppercase w-20">Saat</th>
                {DAYS.map(day => (
                  <th key={day} className="p-2 border border-border text-[11px] uppercase">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="h-12">
                  <td className="bg-muted/30 border border-border text-center text-[10px] font-bold text-muted-foreground">
                    {time}
                  </td>
                  {DAYS.map(day => {
                    const course = getCourseForCell(day, time);
                    return (
                      <td key={day + time} className="border border-border p-1 min-w-[120px]">
                        {course ? (
                          <div className={`h-full w-full rounded p-1 flex items-center justify-center text-center text-[10px] font-black uppercase tracking-tighter ${colorFor(course.course_name).soft} ${colorFor(course.course_name).text}`}>
                            {course.course_name}
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Diğer okullar: Liste görünümü */
        <div className="px-4 pt-4 pb-8 space-y-3 max-w-md mx-auto">
          {DAYS.map(day => {
            const dayCourses = courses
              .filter(c => c.day === day)
              .sort((a, b) => a.start.localeCompare(b.start));

            if (dayCourses.length === 0) return null;

            return (
              <div key={day} className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/50">
                  <span className="text-xs font-bold text-foreground uppercase tracking-widest">{day}</span>
                </div>
                <div className="divide-y divide-border">
                  {dayCourses.map(c => (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-[9px] font-black uppercase ${colorFor(c.course_name).soft} ${colorFor(c.course_name).text}`}>
                        {c.course_name.slice(0, 3)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{c.course_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {c.start} – {c.end}
                          <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            c.course_type === "lab" ? "bg-violet-500/20 text-violet-300" : "bg-sky-500/20 text-sky-300"
                          }`}>
                            {c.course_type === "lab" ? "LAB" : "TEORİK"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm">
              Henüz ders eklenmedi.
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
