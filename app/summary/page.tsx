"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import type { Course } from "@/lib/types"; // Senin az önce attığın types
import { normalizeCourseName } from "@/lib/normalize";
import { supabase } from "@/lib/supabaseClient";

const DEFAULT_ALLOWED_HOURS = 12;

function fixNegZero(n: number) {
  return Object.is(n, -0) ? 0 : n;
}

function riskMeta(missed: number, limit: number) {
  const ratio = limit <= 0 ? 0 : missed / limit;
  if (ratio >= 0.8) {
    return { label: "🔴 Riskli", bar: "bg-rose-500", text: "text-rose-600" };
  }
  if (ratio >= 0.5) {
    return { label: "🟡 Dikkat", bar: "bg-amber-500", text: "text-amber-700" };
  }
  return { label: "🟢 Güvende", bar: "bg-slate-400", text: "text-slate-600" };
}

export default function SummaryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // 1. SUPABASE'DEN VERİLERİ ÇEK
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cData } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id);

      const { data: aData } = await supabase
        .from("attendance")
        .select("course_id, missed_blocks")
        .eq("user_id", user.id);

      if (cData) setCourses(cData as Course[]);
      if (aData) setAttendanceRecords(aData);
    };

    loadData();
  }, []);

  // 2. HESAPLAMA MANTIĞI
  const totals = useMemo(() => {
    const groups: Record<
      string,
      { displayName: string; missed: number; sessions: Course[] }
    > = {};

    // Dersleri grupla
    for (const c of courses) {
      // ✅ BURASI KRİTİK: Artık c.courseName değil, c.course_name kullanıyoruz
      const rawName = c.course_name || "Adsız Ders";
      const g = normalizeCourseName(rawName);
      
      if (!groups[g]) {
        groups[g] = {
          displayName: rawName.trim(),
          missed: 0,
          sessions: [],
        };
      }
      groups[g].sessions.push(c);
    }

    // Devamsızlıkları ekle
    for (const record of attendanceRecords) {
      const relatedCourse = courses.find(c => String(c.id) === String(record.course_id));
      if (!relatedCourse) continue;

      const g = normalizeCourseName(relatedCourse.course_name);
      
      if (groups[g]) {
        groups[g].missed += Number(record.missed_blocks) || 0;
      }
    }

    return Object.entries(groups)
      .map(([groupKey, val]) => ({
        groupKey,
        ...val,
        missed: fixNegZero(val.missed),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "tr"));
  }, [courses, attendanceRecords]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader title="Devamsızlıklar" />

      <div className="mx-auto max-w-md px-4 pt-4">
        {totals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <div className="text-sm font-semibold text-slate-900">Henüz ders yok</div>
            <div className="mt-1 text-xs text-slate-500">Ders eklediğinde toplamlar burada gözükecek.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {totals.map((g) => {
              const missed = g.missed;
              const limit = DEFAULT_ALLOWED_HOURS;
              const remaining = fixNegZero(Math.max(0, limit - missed));
              const pct = Math.min(100, Math.round((missed / limit) * 100));
              const r = riskMeta(missed, limit);

              return (
                <div key={g.groupKey} className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* ✅ displayName zaten yukarıda course_name'den üretildi */}
                      <div className="text-sm font-semibold text-slate-900">{g.displayName}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {g.sessions.length} oturum • <span className={r.text}>{r.label}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-semibold text-slate-900">{missed} / {limit} saat</div>
                      <div className="text-slate-500 text-[10px]">Kalan: {remaining} s.</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-2 transition-all duration-500 ${r.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}