"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/lib/types";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
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
      const { data, error } = await supabase.from("courses").select("*").eq("user_id", user.id);
      if (!error && data) setCourses(data as Course[]);
    };
    loadAllCourses();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader 
        title="Weekly Schedule" 
        left={
          <button onClick={() => router.push('/dashboard')} className="p-2 text-2xl text-slate-900 active:scale-75 transition-transform">
            ‹
          </button>
        }
      />

      <div className="p-4 overflow-x-auto">
        <div className="min-w-[900px] bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          {/* Header: Günler */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-900 text-white">
            <div className="p-4 border-r border-slate-800 text-[10px] font-black text-center uppercase tracking-widest text-slate-500">Saat</div>
            {DAYS.map(day => (
              <div key={day} className="p-4 text-center text-[11px] font-black uppercase tracking-widest border-r border-slate-800 last:border-0">{day}</div>
            ))}
          </div>

          {/* Grid Gövdesi */}
          <div className="relative grid grid-cols-[80px_repeat(5,1fr)] bg-slate-100" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, 60px)` }}>
            
            {/* Arka Plan Hücreleri (Boş kutular) */}
            {TIME_SLOTS.map((_, rowIndex) => (
              <>
                <div key={`time-${rowIndex}`} className="bg-slate-50 border-b border-r border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {TIME_SLOTS[rowIndex]}
                </div>
                {DAYS.map((_, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`} className="bg-white border-b border-r border-slate-100 last:border-r-0" />
                ))}
              </>
            ))}

            {/* Katman: Dersler (Absolute Pozisyonlama ile Yayılma) */}
            {courses.map((course) => {
              const colIndex = DAYS.indexOf(course.day);
              const rowIndex = TIME_SLOTS.indexOf(course.start);

              if (colIndex === -1 || rowIndex === -1) return null;

              return (
                <div
                  key={course.id}
                  className="absolute p-1 transition-all hover:z-20"
                  style={{
                    left: `${80 + colIndex * (100 / 5)}%`,
                    top: `${rowIndex * 60}px`,
                    width: `${100 / 5}%`,
                    height: `${course.blocks * 60}px`, // Blok sayısına göre aşağı uzatır
                  }}
                >
                  <div className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center text-center shadow-sm p-2
                    ${course.course_name.includes('ENG') ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                      course.course_name.includes('MATH') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 
                      course.course_name.includes('BA') ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                      'bg-slate-50 border-slate-200 text-slate-700'}
                  `}>
                    <div className="text-[10px] font-black leading-tight uppercase tracking-tighter">{course.course_name}</div>
                    <div className="text-[9px] font-bold opacity-60 mt-1">{course.blocks} Blok</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}