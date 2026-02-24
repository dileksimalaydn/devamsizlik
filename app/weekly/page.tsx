"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/lib/types";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
// Sol tarafta görünecek saat dilimleri (Senin OBS sistemine uygun)
const TIME_SLOTS = [
  "08:30", "09:25", "10:20", "11:15", "12:10", 
  "13:05", "14:00", "14:55", "15:50", "16:45", 
  "17:40", "18:35", "19:30", "20:25", "21:20"
];

export default function WeeklyPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadAllCourses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/login");

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) setCourses(data as Course[]);
    };
    loadAllCourses();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader 
        title="Weekly Timetable" 
        left={
          <button onClick={() => router.push('/dashboard')} className="p-2 text-2xl text-slate-900 active:scale-75 transition-transform">
            ‹
          </button>
        }
      />

      <div className="p-4 overflow-x-auto select-none">
        <div className="min-w-[800px] bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          {/* Üst Başlık: Günler */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] bg-slate-900 text-white border-b border-slate-800">
            <div className="p-4 border-r border-slate-800 text-[10px] font-black text-center uppercase tracking-widest text-slate-500">Saat</div>
            {DAYS.map(day => (
              <div key={day} className="p-4 text-center text-[11px] font-black uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Tablo İçeriği: Saatler ve Hücreler */}
          <div className="divide-y divide-slate-100">
            {TIME_SLOTS.map(time => (
              <div key={time} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] min-h-[60px]">
                {/* Sol Saat Sütunu */}
                <div className="bg-slate-50 border-r border-slate-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400">{time}</span>
                </div>

                {/* Gün Hücreleri */}
                {DAYS.map(day => {
                  // Bu saatte ve bu günde ders var mı?
                  const course = courses.find(c => c.day === day && c.start === time);
                  
                  return (
                    <div key={day + time} className="border-r border-slate-50 p-1 relative min-h-[60px] flex items-stretch">
                      {course && (
                        <div 
                          className={`w-full p-2 rounded-xl flex flex-col justify-center items-center text-center shadow-sm border transition-all hover:scale-[1.02] z-10
                            ${course.course_name.includes('ENG') ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                              course.course_name.includes('BA') ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                              'bg-indigo-50 border-indigo-200 text-indigo-700'}
                          `}
                          style={{
                            // Eğer ders birden fazla bloksa kutuyu o kadar büyütür (Opsiyonel görsel geliştirme)
                            height: '100%' 
                          }}
                        >
                          <div className="text-[10px] font-black leading-tight uppercase">
                            {course.course_name}
                          </div>
                          <div className="text-[8px] font-bold opacity-60 mt-1">
                            {course.blocks} Blok
                          </div>
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

      <div className="px-6 mt-4 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase italic">
          * Boşluklar ders aralarını temsil eder.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}