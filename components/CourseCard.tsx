"use client";

import type { Course } from "@/lib/types";
import { colorFor } from "@/lib/colors";

function fixNegZero(n: number) {
  return Object.is(n, -0) ? 0 : n;
}

export default function CourseCard({
  course,
  missed,
  onOpenMissed,
  onClearMissed,
}: {
  course: Course;
  missed: number;
  onOpenMissed: () => void;
  onClearMissed: () => void;
}) {
  const palette = colorFor(course.courseName);
  const safeMissed = fixNegZero(missed);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-1 h-10 w-2 rounded-full ${palette.accent}`} />
          <div>
            <div className="text-base font-bold text-slate-900">
              {course.courseName} <span className="text-slate-400">•</span>{" "}
              {course.blocks} blok
            </div>

            <div className="mt-1 text-sm text-slate-600">
              {course.start} – {course.end}
            </div>

            {safeMissed > 0 ? (
              <div className="mt-2 text-sm font-semibold text-rose-600">
                Devamsızlık: {safeMissed} saat
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-500">
                Devamsızlık yok
              </div>
            )}

            {/* ✅ Sade bilgilendirme */}
            <div className="mt-1 text-[11px] text-slate-400">
              Devamsızlık girmek için butona dokun.
            </div>
          </div>
        </div>

        {safeMissed > 0 ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={onOpenMissed}
              className={`rounded-2xl px-3 py-2 text-xs font-semibold text-white ${palette.accent}`}
            >
              Düzenle
            </button>
            <button
              onClick={onClearMissed}
              className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Geri al
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenMissed}
            className={`rounded-2xl px-3 py-2 text-xs font-semibold text-white ${palette.accent}`}
          >
            Devamsızlık işaretle
          </button>
        )}
      </div>
    </div>
  );
}