"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/lib/types";
import AppHeader from "@/components/AppHeader";
import { colorFor } from "@/lib/colors";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

export default function WeeklyPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchAllCourses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id);

      if (data) setCourses(data as Course[]);
    };
    fetchAllCourses();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader 
        left={
          <button onClick={() => router.back()} className="p-2 text-slate-600 font-bold text-xl">
            ‹
          </button>
        }
      />
      
      <div className="p-4 overflow-x-auto">
        {/* Yatayda kaydırılabilir alan (Mobilde rahat görünmesi için) */}
        <div className="min-w-[800px] bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          
          {/* Gün Başlıkları */}
          <div className="grid grid-cols-5 gap-4 border-b border-slate-100 pb-4 mb-4">
            {DAYS.map(day => (
              <div key={day} className="text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {day}
                </div>
              </div>
            ))}
          </div>

          {/* Haftalık Izgara Bilgisi */}
          <div className="grid grid-cols-5 gap-4">
            {DAYS.map(day => (
              <div key={day} className="space-y-3 min-h-[300px] border-r border-slate-50 last:border-0 pr-2">
                {courses
                  .filter(c => c.day === day)
                  .sort((a, b) => a.start.localeCompare(b.start))
                  .map(course => {
                    const palette = colorFor(course.course_name);
                    return (
                      <div 
                        key={course.id} 
                        className={`p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 transition-transform active:scale-95`}
                      >
                        <div className={`h-1.5 w-8 rounded-full ${palette.accent} mb-1`} />
                        <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                          {course.course_name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {course.start} – {course.end}
                        </div>
                        <div className="text-[9px] text-slate-400 font-semibold italic">
                          {course.blocks} Blok
                        </div>
                      </div>
                    );
                  })}
                
                {/* Eğer o gün ders yoksa görsel bir boşluk */}
                {courses.filter(c => c.day === day).length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-20 grayscale">
                    <span className="text-2xl">☕</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt Bilgi ve Dönüş */}
      <div className="mt-6 text-center">
        <p className="text-[10px] text-slate-400 font-medium italic">
          Ekranı yatay çevirerek daha rahat görebilirsin.
        </p>
      </div>
    </main>
  );
}