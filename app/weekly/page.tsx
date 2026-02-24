"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/lib/types";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const TIME_SLOTS = ["08:30", "09:25", "10:20", "11:15", "12:10", "13:05", "14:00", "14:55", "15:50", "16:45", "17:40", "18:35", "19:30", "20:25", "21:20"];

export default function WeeklyPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadAllCourses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/login");
      const { data, error } = await supabase.from("courses").select("*").eq("user_id", user.id);
      if (!error && data) setCourses(data as Course[]);
    };
    loadAllCourses();
  }, [router]);

  // Bir hücrenin bir dersin devamı (blok parçası) olup olmadığını anlayan fonksiyon
  const getCourseForCell = (day: string, time: string) => {
    return courses.find(course => {
      if (course.day !== day) return false;
      const startIndex = TIME_SLOTS.indexOf(course.start);
      const currentIndex = TIME_SLOTS.indexOf(time);
      // Eğer şu anki saat, dersin başlangıç saati ile (başlangıç + blok sayısı) arasındaysa bu hücre doludur
      return currentIndex >= startIndex && currentIndex < startIndex + course.blocks;
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <AppHeader 
        title="Ders Programı" 
        left={<button onClick={() => router.push('/dashboard')} className="p-2 text-2xl">‹</button>} 
      />

      <div className="p-2 overflow-x-auto">
        <div className="min-w-[800px] bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xl">
          {/* Gün Başlıkları */}
          <div className="grid grid-cols-[70px_repeat(5,1fr)] bg-slate-900 text-white border-b border-slate-800 text-center">
            <div className="p-3 text-[10px] font-bold uppercase text-slate-500 border-r border-slate-800">Saat</div>
            {DAYS.map(day => (
              <div key={day} className="p-3 text-[11px] font-bold uppercase border-r border-slate-800 last:border-0">{day}</div>
            ))}
          </div>

          {/* Izgara Akışı */}
          <div className="divide-y divide-slate-100">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="grid grid-cols-[70px_repeat(5,1fr)] min-h-[70px]">
                {/* Sol Saat Sütunu */}
                <div className="bg-slate-50 border-r border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {time}
                </div>

                {/* Gün Hücreleri */}
                {DAYS.map(day => {
                  const course = getCourseForCell(day, time);
                  const isStart = course?.start === time;

                  return (
                    <div key={day + time} className="border-r border-slate-100 last:border-0 p-1 relative flex items-stretch">
                      {course && (
                        <div className={`w-full h-full p-2 flex flex-col items-center justify-center text-center transition-all
                          ${isStart ? 'rounded-t-lg' : ''} 
                          ${(TIME_SLOTS.indexOf(time) === TIME_SLOTS.indexOf(course.start) + course.blocks - 1) ? 'rounded-b-lg' : ''}
                          ${course.course_name.includes('ENG') ? 'bg-blue-100/50 text-blue-800' : 
                            course.course_name.includes('MATH') ? 'bg-indigo-100/50 text-indigo-800' : 
                            'bg-slate-100 text-slate-700'}
                        `}>
                          {isStart ? (
                            <>
                              <div className="text-[10px] font-black leading-tight uppercase">{course.course_name}</div>
                              <div className="text-[9px] font-bold opacity-40 mt-1">{course.blocks} Blok</div>
                            </>
                          ) : (
                            <div className="w-1 h-1 bg-current opacity-20 rounded-full" /> 
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}