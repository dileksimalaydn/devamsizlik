"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, AlertOctagon } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CourseDetailSheet from "@/components/CourseDetailSheet";
import type { Course, AttendanceRecord } from "@/lib/types";
import { normalizeCourseName } from "@/lib/normalize";
import { supabase } from "@/lib/supabaseClient";

// Türk üniversitelerinde standart dönem = 14 hafta, limit = toplam saatin %30'u
const WEEKS = 14;
const ABSENCE_RATIO = 0.30;

function calcLimit(sessions: Course[]): number {
  const totalWeeklyBlocks = sessions.reduce((sum, s) => sum + s.blocks, 0);
  return Math.max(1, Math.round(totalWeeklyBlocks * WEEKS * ABSENCE_RATIO));
}

function fixNegZero(n: number) {
  return Object.is(n, -0) ? 0 : n;
}

function riskMeta(missed: number, limit: number) {
  const ratio = limit <= 0 ? 0 : missed / limit;
  if (ratio >= 0.8) {
    return { label: "Riskli", bar: "bg-rose-500", text: "text-rose-600", badge: "bg-rose-100 text-rose-700" };
  }
  if (ratio >= 0.5) {
    return { label: "Dikkat", bar: "bg-amber-400", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" };
  }
  return { label: "Güvende", bar: "bg-emerald-400", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" };
}

type GroupData = {
  groupKey: string;
  displayName: string;
  missed: number;
  limit: number;
  sessions: Course[];
  records: AttendanceRecord[];
};

export default function SummaryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cData } = await supabase
      .from("courses").select("*").eq("user_id", user.id);

    const { data: aData } = await supabase
      .from("attendance").select("course_id, missed_blocks, date").eq("user_id", user.id);

    if (cData) setCourses(cData as Course[]);
    if (aData) setAttendanceRecords(aData as AttendanceRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totals = useMemo<GroupData[]>(() => {
    const groups: Record<
      string,
      { displayName: string; missed: number; sessions: Course[]; records: AttendanceRecord[] }
    > = {};

    for (const c of courses) {
      const rawName = c.course_name || "Adsız Ders";
      const g = normalizeCourseName(rawName);
      if (!groups[g]) {
        groups[g] = { displayName: rawName.trim(), missed: 0, sessions: [], records: [] };
      }
      groups[g].sessions.push(c);
    }

    for (const record of attendanceRecords) {
      const relatedCourse = courses.find((c) => String(c.id) === String(record.course_id));
      if (!relatedCourse) continue;
      const g = normalizeCourseName(relatedCourse.course_name);
      if (groups[g]) {
        groups[g].missed += Number(record.missed_blocks) || 0;
        groups[g].records.push(record);
      }
    }

    return Object.entries(groups)
      .map(([groupKey, val]) => ({
        groupKey,
        ...val,
        missed: fixNegZero(val.missed),
        limit: calcLimit(val.sessions),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "tr"));
  }, [courses, attendanceRecords]);

  const expandedGroupData = expandedGroup
    ? totals.find((t) => t.groupKey === expandedGroup) ?? null
    : null;

  // Risk uyarı banner verisi
  const criticalCount = totals.filter((g) => g.missed / g.limit >= 0.8).length;
  const warnCount = totals.filter((g) => g.missed / g.limit >= 0.5 && g.missed / g.limit < 0.8).length;

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <AppHeader title="Devamsızlıklar" />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-3">

        {/* Risk uyarı banner */}
        {!loading && (criticalCount > 0 || warnCount > 0) && (
          <div className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${
            criticalCount > 0
              ? "bg-rose-50 border-rose-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            {criticalCount > 0
              ? <AlertOctagon size={18} className="text-rose-600 shrink-0 mt-0.5" />
              : <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            }
            <div>
              <div className={`text-sm font-bold ${criticalCount > 0 ? "text-rose-800" : "text-amber-800"}`}>
                {criticalCount > 0
                  ? `${criticalCount} dersinde sınıra çok yaklaştın!`
                  : `${warnCount} dersinde dikkatli ol.`}
              </div>
              <div className={`text-xs mt-0.5 ${criticalCount > 0 ? "text-rose-600" : "text-amber-600"}`}>
                {criticalCount > 0
                  ? "Devamsızlık hakkının %80'ini doldurdun."
                  : "Devamsızlık hakkının %50'sini doldurdun."}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100 animate-pulse">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                    <div className="h-3 w-1/3 rounded-full bg-slate-100" />
                  </div>
                  <div className="h-4 w-20 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : totals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <div className="text-sm font-semibold text-slate-900">Henüz ders yok</div>
            <div className="mt-1 text-xs text-slate-500">
              Ders eklediğinde toplamlar burada gözükecek.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {totals.map((g) => {
              const { missed, limit } = g;
              const remaining = fixNegZero(Math.max(0, limit - missed));
              const pct = Math.min(100, Math.round((missed / limit) * 100));
              const r = riskMeta(missed, limit);

              return (
                <button
                  key={g.groupKey}
                  onClick={() => setExpandedGroup(g.groupKey)}
                  className="w-full rounded-3xl bg-white p-4 shadow-sm border border-slate-100 text-left active:scale-[0.98] transition-all hover:border-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{g.displayName}</div>
                      <div className="mt-1">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${r.badge}`}>
                          {r.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs">
                        <div className="font-bold text-slate-900">
                          {missed} <span className="font-normal text-slate-400">/</span> {limit} saat
                        </div>
                        <div className="text-slate-400 text-[10px]">{remaining} saat kaldı</div>
                      </div>
                      <span className="text-slate-300 text-lg">›</span>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${r.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                    <span>0</span>
                    <span className="font-medium">%{pct} doldu</span>
                    <span>{limit} saat</span>
                  </div>
                </button>
              );
            })}

            {/* Alt not */}
            <p className="text-center text-[10px] text-slate-400 pb-2">
              Limitler {WEEKS} haftalık dönem, %{Math.round(ABSENCE_RATIO * 100)} devamsızlık kuralına göre hesaplanır.
            </p>
          </div>
        )}
      </div>

      <BottomNav />

      {expandedGroupData && (
        <CourseDetailSheet
          open
          displayName={expandedGroupData.displayName}
          sessions={expandedGroupData.sessions}
          records={expandedGroupData.records}
          onClose={() => setExpandedGroup(null)}
          onRefresh={loadData}
        />
      )}
    </main>
  );
}
