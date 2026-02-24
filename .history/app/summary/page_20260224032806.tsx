"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import type { Course } from "@/lib/types";
import { courseKey, loadAttendance, loadCourses } from "@/lib/storage";
import { colorFor } from "@/lib/colors";

const DEFAULT_ALLOWED_HOURS = 12;

export default function SummaryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Record<string, number>>({});

  useEffect(() => {
    setCourses(loadCourses());
    setAttendance(loadAttendance());
  }, []);

  const totals = useMemo(() => {
    const map: Record<string, { course: Course; missed: number }> = {};
    for (const c of courses) map[courseKey(c)] = { course: c, missed: 0 };

    for (const [k, v] of Object.entries(attendance)) {
      const idx = k.indexOf("|");
      if (idx === -1) continue;
      const ck = k.slice(idx + 1);
      if (!map[ck]) continue;
      map[ck].missed += Number(v) || 0;
    }

    return Object.values(map).sort((a, b) =>
      a.course.courseName.localeCompare(b.course.courseName, "tr")
    );
  }, [courses, attendance]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader title="Devamsızlıklar" right={<a href="/setup" className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">+ Ders</a>} />

      <div className="mx-auto max-w-md px-4 pt-4">
        {totals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <div className="text-sm font-semibold text-slate-900">Henüz ders yok</div>
            <div className="mt-1 text-xs text-slate-500">Önce ders ekle, sonra devamsızlıklar burada gözükecek.</div>
            <a href="/setup" className="mt-4 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Ders Ekle</a>
          </div>
        ) : (
          <div className="space-y-3">
            {totals.map(({ course, missed }) => {
              const p = colorFor(course.courseName);
              const remaining = Math.max(0, DEFAULT_ALLOWED_HOURS - missed);
              const pct = Math.min(100, Math.round((missed / DEFAULT_ALLOWED_HOURS) * 100));

              return (
                <div key={courseKey(course)} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">{course.courseName}</div>
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-rose-600">-{missed} saat</span> / {remaining} kaldı
                    </div>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-2 ${p.accent}`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400">
                    Limit şimdilik {DEFAULT_ALLOWED_HOURS} saat (sonra derse özel ayar ekleriz).
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