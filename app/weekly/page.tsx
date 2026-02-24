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

  // Hücrede hangi dersin görünmesi gerektiğini bulan fonksiyon
  const getCourseForCell = (day: string, time: string) => {
    return courses.find(c => {
      if (c.day !== day) return false;
      const startIdx = TIME_SLOTS.indexOf(c.start);
      const currentIdx = TIME_SLOTS.indexOf(time);
      // Şu anki saat dilimi, dersin başlangıcı ve blok süresi içindeyse o dersi döndür
      return currentIdx >= startIdx && currentIdx < startIdx + c.blocks;
    });
  };

  return (
    <main className="min-h-screen bg-white pb-24 text-slate-900">
      <AppHeader 
        title="Haftalık Program" 
        left={<button onClick={() => router.push('/dashboard')} className="p-2 text-2xl">‹</button>} 
      />

      <div className="p-2 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse border border-slate-200 shadow-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-2 border border-slate-700 text-[10px] uppercase w-20">Saat</th>
              {DAYS.map(day => (
                <th key={day} className="p-2 border border-slate-700 text-[11px] uppercase">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="h-12">
                <td className="bg-slate-50 border border-slate-200 text-center text-[10px] font-bold text-slate-400">
                  {time}
                </td>
                {DAYS.map(day => {
                  const course = getCourseForCell(day, time);
                  
                  return (
                    <td key={day + time} className="border border-slate-100 p-1 min-w-[120px]">
                      {course ? (
                        <div className={`h-full w-full rounded p-1 flex items-center justify-center text-center text-[10px] font-black uppercase tracking-tighter
                          ${course.course_name.includes('ENG') ? 'bg-blue-100 text-blue-800' : 
                            course.course_name.includes('MATH') ? 'bg-indigo-100 text-indigo-800' : 
                            'bg-slate-100 text-slate-700'}
                        `}>
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
      
      <div className="px-6 mt-4">
        <p className="text-[10px] text-slate-400 italic">* Ders adları her blok için ilgili hücrede tekrar eder.</p>
      </div>

      <BottomNav />
    </main>
  );
}