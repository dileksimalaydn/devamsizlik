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
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((n) => (
        <button
          key={n}
          onClick={() => onPick(n)}
          className={`rounded-xl py-3 text-xs font-bold border transition-all active:scale-95 ${
            current === n
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {n === blocks && n !== 1 && n !== 2 ? "TAMAMI" : `${n} SAAT`}
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("attendance").upsert(
      { user_id: user.id, course_id: courseId, date, missed_blocks: missedBlocks },
      { onConflict: "user_id,course_id,date" }
    );
    setEditingKey(null);
    setAddMode(false);
    onRefresh();
  };

  const del = async (r: AttendanceRecord) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("attendance").delete()
      .eq("user_id", user.id).eq("course_id", r.course_id).eq("date", r.date);
    setEditingKey(null);
    onRefresh();
  };

  const newSession = newDate ? findSession(newDate) : undefined;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl flex flex-col overflow-hidden transition-all"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Görsel Sürükleme Çubuğu */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{displayName}</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
              {records.length} KAYIT BULUNDU
            </p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold hover:bg-slate-100 transition">
            ✕
          </button>
        </div>

        {/* Records List */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {sorted.length === 0 && !addMode && (
            <div className="text-center py-16">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Henüz veri girişi yapılmadı</p>
            </div>
          )}

          {sorted.map((rec) => {
            const session = sessions.find((s) => String(s.id) === String(rec.course_id));
            const key = recordKey(rec);
            const isEditing = editingKey === key;

            return (
              <div key={key} className="space-y-2">
                <button
                  onClick={() => setEditingKey(isEditing ? null : key)}
                  className={`w-full rounded-2xl border px-5 py-4 flex items-center justify-between transition-all ${
                    isEditing ? "bg-slate-900 border-slate-900 shadow-xl scale-[1.02]" : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="text-left">
                    <div className={`text-sm font-black ${isEditing ? "text-white" : "text-slate-900"}`}>
                      {prettyTR(rec.date).toUpperCase()}
                    </div>
                    {session && (
                      <div className={`text-[10px] font-bold mt-1 ${isEditing ? "text-slate-400" : "text-slate-400"}`}>
                        {session.start} — {session.end}
                      </div>
                    )}
                  </div>
                  <div className={`text-sm font-black px-3 py-1 rounded-lg ${isEditing ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"}`}>
                    {rec.missed_blocks}H
                  </div>
                </button>

                {isEditing && session && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Süreyi Düzenle</div>
                    <HourButtons blocks={session.blocks} current={rec.missed_blocks} onPick={(n) => save(rec.course_id, rec.date, n)} />
                    <button onClick={() => del(rec)} className="w-full py-3 text-[10px] font-black text-rose-500 uppercase tracking-widest border-t border-rose-100 mt-2">
                      Kaydı Tamamen Sil
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {addMode && (
            <div className="p-5 rounded-[24px] bg-slate-50 border-2 border-dashed border-slate-200 space-y-5 animate-in slide-in-from-top-4">
              <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Yeni Giriş</div>
              <input
                type="date"
                value={newDate}
                max={todayISO()}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 transition"
              />
              {newDate && (
                newSession ? (
                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Mevcut Blok: {newSession.blocks}
                    </div>
                    <HourButtons blocks={newSession.blocks} onPick={(n) => save(newSession.id, newDate, n)} />
                  </div>
                ) : (
                  <div className="py-4 text-center border border-rose-100 bg-rose-50 rounded-xl">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Bu tarihte ders tanımlı değil</p>
                  </div>
                )
              )}
              <button onClick={() => setAddMode(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">İptal</button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!addMode && (
          <div className="p-6 bg-white border-t border-slate-50">
            <button
              onClick={() => { setAddMode(true); setEditingKey(null); setNewDate(todayISO()); }}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-200 active:scale-95 transition-all uppercase tracking-widest"
            >
              Yeni Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}