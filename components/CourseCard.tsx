"use client";

import type { Course } from "@/lib/types";
import { colorFor } from "@/lib/colors";

function fixNegZero(n: number) {
  return Object.is(n, -0) ? 0 : n;
}

function formatDuration(blocks: number): string {
  const totalMin = blocks * 45 + Math.max(0, blocks - 1) * 10;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} dk`;
  if (m === 0) return `${h} saat`;
  return `${h}s ${m}dk`;
}

// Props tipini dışarıda tanımlayalım ki daha temiz olsun
interface CourseCardProps {
  course: Course;
  missed: number;
  onOpenMissed: () => void;
  onClearMissed: () => void | Promise<void>; // Hem normal hem async destekler
  onDelete?: () => void; // Opsiyonel (Soru işareti burada çok kritik)
}

export default function CourseCard({
  course,
  missed,
  onOpenMissed,
  onClearMissed,
  onDelete,
}: CourseCardProps) {
  const palette = colorFor(course.course_name);
  const safeMissed = fixNegZero(missed);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-2">
            <div className={`h-10 w-2 rounded-full ${palette.accent}`} />
            
            {/* Sadece onDelete varsa çöp kutusunu göster */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                title="Dersi Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
              </button>
            )}
          </div>

          <div>
            <div className="text-base font-bold text-slate-900">
              {course.course_name} <span className="text-slate-400">•</span>{" "}
              {formatDuration(course.blocks)}
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
          </div>
        </div>

        {/* Sağ Taraf: Butonlar */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenMissed}
            className={`rounded-2xl px-3 py-2 text-xs font-semibold text-white shadow-sm active:scale-95 transition-all ${palette.accent}`}
          >
            {safeMissed > 0 ? "Düzenle" : "İşaretle"}
          </button>

          {safeMissed > 0 && (
            <button
              type="button"
              onClick={() => onClearMissed()}
              className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            >
              Geri al
            </button>
          )}
        </div>
      </div>
    </div>
  );
}