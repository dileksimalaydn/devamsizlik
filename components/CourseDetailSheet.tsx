"use client";

import { useState } from "react";
import type { Course, AttendanceRecord } from "@/lib/types";
import { dayNameTR, prettyTR, todayISO } from "@/lib/date";
import { supabase } from "@/lib/supabaseClient";
import { X, Calendar, Clock, Trash2, Plus } from "lucide-react";

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
          className={`rounded-xl py-3 text-sm font-semibold border transition-all active:scale-95 ${
            current === n
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl flex flex-col overflow-hidden transition-all"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobil Sürükleme Tutamacı */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        {/* Header - SetupPage'deki AppHeader havasında */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{displayName}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Toplam {records.length} devamsızlık kaydı
            </p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
            <X size={18} />
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4 bg-slate-50/30">
          {sorted.length === 0 && !addMode && (
            <div className="text-center py-16 px-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                <Calendar size={24} />
              </div>
              <p className="text-sm font-medium text-slate-500">Henüz bir devamsızlık kaydı girmedin.</p>
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
                  className={`w-full rounded-[24px] border px-5 py-4 flex items-center justify-between transition-all active:scale-[0.98] ${
                    isEditing 
                      ? "bg-white border-indigo-200 shadow-md ring-4 ring-indigo-50" 
                      : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                >
                  <div className="text-left">
                    <div className="text-[14px] font-bold text-slate-900">
                      {prettyTR(rec.date)}
                    </div>
                    {session && (
                      <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={10} /> {session.start} — {session.end}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${
                      isEditing ? "bg-indigo-600 text-white" : "bg-rose-50 text-rose-600"
                    }`}>
                      {rec.missed_blocks} saat
                    </span>
                  </div>
                </button>

                {isEditing && session && (
                  <div className="p-4 rounded-[24px] bg-white border border-indigo-100 shadow-sm space-y-4 animate-in zoom-in-95 duration-200">
                    <label className="text-xs font-semibold text-slate-800 ml-1">Süreyi Değiştir</label>
                    <HourButtons blocks={session.blocks} current={rec.missed_blocks} onPick={(n) => save(rec.course_id, rec.date, n)} />
                    <button 
                      onClick={() => del(rec)} 
                      className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                    >
                      <Trash2 size={14} /> Kaydı Sil
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {addMode && (
            <div className="p-5 rounded-[28px] bg-white border border-slate-200 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                Yeni Kayıt Ekle
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 ml-1">Tarih Seçin</label>
                <input
                  type="date"
                  value={newDate}
                  max={todayISO()}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-400 transition"
                />
              </div>

              {newDate && (
                newSession ? (
                  <div className="space-y-3 pt-2">
                    <div className="text-[11px] font-semibold text-slate-500 ml-1">
                      Blok seçerek kaydı tamamla:
                    </div>
                    <HourButtons blocks={newSession.blocks} onPick={(n) => save(newSession.id, newDate, n)} />
                  </div>
                ) : (
                  <div className="py-4 px-3 text-center border border-rose-100 bg-rose-50 rounded-2xl">
                    <p className="text-xs font-semibold text-rose-600">Bu tarihte {displayName} dersi bulunmuyor.</p>
                  </div>
                )
              )}
              
              <button 
                onClick={() => setAddMode(false)} 
                className="w-full text-xs font-semibold text-slate-400 py-1 hover:text-slate-600 transition"
              >
                İptal Et
              </button>
            </div>
          )}
        </div>

        {/* Footer - SetupPage'deki Kaydet butonu stili */}
        {!addMode && (
          <div className="p-6 bg-white border-t border-slate-100">
            <button
              onClick={() => { setAddMode(true); setEditingKey(null); setNewDate(todayISO()); }}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Devamsızlık Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}