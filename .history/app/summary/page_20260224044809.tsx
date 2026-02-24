"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import type { Course } from "@/lib/types";
import { courseKey, loadAttendance, loadCourses } from "@/lib/storage";
import { normalizeCourseName } from "@/lib/normalize";

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
  const [attendance, setAttendance] = useState<Record<string, number>>({});

  useEffect(() => {
    setCourses(loadCourses());
    setAttendance(loadAttendance());
  }, []);

  const totals = useMemo(() => {
    const courseKeyToGroup: Record<string, string> = {};
    const groups: Record<
      string,
      { displayName: string; missed: number; sessions: Course[] }
    > = {};

    for (const c of courses) {
      const g = normalizeCourseName(c.courseName);
      const ck = courseKey(c);
      courseKeyToGroup[ck] = g;

      if (!groups[g]) {
        groups[g] = {
          displayName: c.courseName.trim(),
          missed: 0,
          sessions: [],
        };
      }
      groups[g].sessions.push(c);
    }

    for (const [k, v] of Object.entries(attendance)) {
      const idx = k.indexOf("|");
      if (idx === -1) continue;

      const ck = k.slice(idx + 1); // dateISO|COURSEKEY -> COURSEKEY
      const g = courseKeyToGroup[ck];
      if (!g) continue;

      groups[g].missed += Number(v) || 0;
    }

    return Object.entries(groups)
      .map(([groupKey, val]) => ({
        groupKey,
        ...val,
        missed: fixNegZero(val.missed),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "tr"));
  }, [courses, attendance]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        title="Devamsızlıklar"
        right={
          <a
            href="/setup"
            className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            + Ders
          </a>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4">
        {totals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <div className="text-sm font-semibold text-slate-900">Henüz ders yok</div>
            <div className="mt-1 text-xs text-slate-500">
              Önce ders ekle, sonra devamsızlıklar burada gözükecek.
            </div>
            <a
              href="/setup"
              className="mt-4 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Ders Ekle
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {totals.map((g) => {
              const missed = fixNegZero(g.missed);
              const limit = DEFAULT_ALLOWED_HOURS;
              const remaining = fixNegZero(Math.max(0, limit - missed));
              const pct = Math.min(100, Math.round((missed / limit) * 100));

              const r = riskMeta(missed, limit);

              return (
                <div key={g.groupKey} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {g.displayName}
                      </div>

                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {g.sessions.length} oturum •{" "}
                        <span className={r.text}>{r.label}</span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-semibold text-slate-900">
                        {missed} / {limit} saat
                      </div>
                      <div className="text-slate-500">Kalan: {remaining} saat</div>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-2 ${r.bar}`} style={{ width: `${pct}%` }} />
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