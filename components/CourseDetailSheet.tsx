"use client";

import { useState } from "react";
import type { Course, AttendanceRecord } from "@/lib/types";
import { dayNameTR, prettyTR, todayISO } from "@/lib/date";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  open: boolean;
  displayName: string;
  sessions: Course[];
  records: AttendanceRecord[];
  onClose: () => void;
  onRefresh: () => void;
};

function HourButtons({
  blocks,
  current,
  onPick,
}: {
  blocks: number;
  current?: number;
  onPick: (n: number) => void;
}) {
  const options = Array.from(new Set([1, 2, blocks].filter((n) => n > 0 && n <= blocks)));
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((n) => (
        <button
          key={n}
          onClick={() => onPick(n)}
          className={`rounded-xl py-2.5 text-xs font-semibold border transition-all active:scale-95 ${
            current === n
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
          }`}
        >
          {n === blocks && n !== 1 && n !== 2 ? "Tamamı" : `${n} saat`}
        </button>
      ))}
    </div>
  );
}

export default function CourseDetailSheet({
  open,
  displayName,
  sessions,
  records,
  onClose,
  onRefresh,
}: Props) {
  const [addMode, setAddMode] = useState(false);
  const [newDate, setNewDate] = useState(todayISO());
  const [editingKey, setEditingKey] = useState<string | null>(null);

  if (!open) return null;

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const findSession = (date: string): Course | undefined =>
    sessions.find((s) => s.day === dayNameTR(date));

  const recordKey = (r: AttendanceRecord) => `${r.course_id}-${r.date}`;

  const save = async (courseId: string, date: string, missedBlocks: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("attendance")
      .upsert(
        { user_id: user.id, course_id: courseId, date, missed_blocks: missedBlocks },
        { onConflict: "user_id,course_id,date" }
      );

    setEditingKey(null);
    setAddMode(false);
    onRefresh();
  };

  const del = async (r: AttendanceRecord) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("attendance")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", r.course_id)
      .eq("date", r.date);

    setEditingKey(null);
    onRefresh();
  };

  const newSession = newDate ? findSession(newDate) : undefined;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-xl flex flex-col"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <div className="text-base font-bold text-slate-900">{displayName}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {records.length > 0
                ? `${records.length} devamsızlık kaydı`
                : "Henüz devamsızlık yok"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Records */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {sorted.length === 0 && !addMode && (
            <div className="text-center py-8 text-sm text-slate-400">
              Henüz devamsızlık kaydı yok.
            </div>
          )}

          {sorted.map((rec) => {
            const session = sessions.find((s) => String(s.id) === String(rec.course_id));
            const key = recordKey(rec);
            const isEditing = editingKey === key;

            return (
              <div key={key}>
                <button
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between active:scale-[0.98] transition-all"
                  onClick={() => setEditingKey(isEditing ? null : key)}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900">
                      {prettyTR(rec.date)}
                    </div>
                    {session && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {session.start} – {session.end}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-rose-500">
                      {rec.missed_blocks} saat
                    </span>
                    <span
                      className={`text-slate-400 text-sm transition-transform duration-200 ${
                        isEditing ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                  </div>
                </button>

                {isEditing && session && (
                  <div className="mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 space-y-2">
                    <div className="text-xs text-slate-500 font-medium">Kaç saat gelmedin?</div>
                    <HourButtons
                      blocks={session.blocks}
                      current={rec.missed_blocks}
                      onPick={(n) => save(rec.course_id, rec.date, n)}
                    />
                    <button
                      onClick={() => del(rec)}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-600 mt-1"
                    >
                      Kaydı Sil
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add new */}
          {addMode && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 mt-1 space-y-2">
              <div className="text-xs font-semibold text-emerald-700">Yeni Devamsızlık Ekle</div>
              <input
                type="date"
                value={newDate}
                max={todayISO()}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              {newDate &&
                (newSession ? (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-500">
                      {newSession.start} – {newSession.end} dersi için:
                    </div>
                    <HourButtons
                      blocks={newSession.blocks}
                      onPick={(n) => save(newSession.id, newDate, n)}
                    />
                  </div>
                ) : (
                  <div className="text-xs text-rose-500 text-center py-1">
                    Bu tarihte {displayName} dersi bulunmuyor.
                  </div>
                ))}
              <button
                onClick={() => setAddMode(false)}
                className="text-xs text-slate-400 pt-1"
              >
                İptal
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!addMode && (
          <div className="px-4 py-4 border-t border-slate-100">
            <button
              onClick={() => {
                setAddMode(true);
                setEditingKey(null);
                setNewDate(todayISO());
              }}
              className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white active:scale-[0.98] transition-all"
            >
              + Devamsızlık Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
