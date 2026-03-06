"use client";

import { useState } from "react";
import type { Course, AttendanceRecord } from "@/lib/types";
import { dayNameTR, prettyTR, todayISO } from "@/lib/date";
import { supabase } from "@/lib/supabaseClient";
import { X, Calendar, Clock, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const SHORT_MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

type Props = {
  open: boolean;
  displayName: string;
  sessions: Course[];
  records: AttendanceRecord[];
  onClose: () => void;
  onRefresh: () => void;
};

function HourButtons({ blocks, current, onPick }: { blocks: number; current?: number; onPick: (n: number) => void }) {
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

function getCourseDatesInMonth(sessions: Course[], year: number, month: number, recordedDates: Set<string>) {
  const today = todayISO();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: { date: string; session: Course }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (dateStr > today) continue;
    if (recordedDates.has(dateStr)) continue;
    const session = sessions.find((s) => s.day === dayNameTR(dateStr));
    if (session) result.push({ date: dateStr, session });
  }
  return result;
}

export default function CourseDetailSheet({ open, displayName, sessions, records, onClose, onRefresh }: Props) {
  const now = new Date();
  const [addMode, setAddMode] = useState(false);
  const [addMonth, setAddMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const scrollRef = { current: null as HTMLDivElement | null };

  if (!open) return null;

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const recordKey = (r: AttendanceRecord) => `${r.course_id}-${r.date}`;
  const recordedDates = new Set(records.map((r) => r.date));

  const isCurrentMonth = addMonth.year === now.getFullYear() && addMonth.month === now.getMonth();
  const chipDates = getCourseDatesInMonth(sessions, addMonth.year, addMonth.month, recordedDates);

  const prevMonth = () => {
    setSelectedDate(null);
    setAddMonth((m) => {
      if (m.month === 0) return { year: m.year - 1, month: 11 };
      return { year: m.year, month: m.month - 1 };
    });
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    setSelectedDate(null);
    setAddMonth((m) => {
      if (m.month === 11) return { year: m.year + 1, month: 0 };
      return { year: m.year, month: m.month + 1 };
    });
  };

  const save = async (courseId: string, date: string, missedBlocks: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("attendance").upsert(
      { user_id: user.id, course_id: courseId, date, missed_blocks: missedBlocks },
      { onConflict: "user_id,course_id,date" }
    );
    setEditingKey(null);
    setSelectedDate(null);
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[32px] bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{displayName}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {addMode ? "Eklemek istediğin günü seç" : `Toplam ${records.length} devamsızlık kaydı`}
            </p>
          </div>
          <button
            onClick={addMode ? () => { setAddMode(false); setSelectedDate(null); } : onClose}
            className="h-9 w-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* İçerik */}
        <div ref={(el) => { scrollRef.current = el; }} className="overflow-y-auto flex-1 bg-slate-50/30">
          {addMode ? (
            <div className="px-5 py-4 space-y-4">
              {/* Ay Navigator */}
              <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
                <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>
                <span className="text-sm font-bold text-slate-900">
                  {TR_MONTHS[addMonth.month]} {addMonth.year}
                </span>
                <button onClick={nextMonth} disabled={isCurrentMonth} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition disabled:opacity-30">
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>

              {/* Chip'ler */}
              {chipDates.length === 0 ? (
                <div className="py-10 text-center text-sm font-medium text-slate-400">
                  Bu ayda eklenecek ders günü yok.
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {chipDates.map(({ date }) => {
                    const dayAbbr = dayNameTR(date).slice(0, 3);
                    const dayNum = parseInt(date.slice(8));
                    const monthAbbr = SHORT_MONTHS[parseInt(date.slice(5, 7)) - 1];
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(isSelected ? null : date)}
                        className={`shrink-0 flex flex-col items-center rounded-2xl px-3 py-2.5 border transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        <span className="text-[10px] font-semibold">{dayAbbr}</span>
                        <span className="text-sm font-extrabold">{dayNum}</span>
                        <span className="text-[10px] font-medium">{monthAbbr}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Saat seçimi */}
              {selectedDate && (() => {
                const session = sessions.find((s) => s.day === dayNameTR(selectedDate));
                if (!session) return null;
                return (
                  <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm space-y-3 animate-in zoom-in-95 duration-150">
                    <p className="text-xs font-semibold text-slate-500">{prettyTR(selectedDate)} — kaç saat gelmedin?</p>
                    <HourButtons blocks={session.blocks} onPick={(n) => save(session.id, selectedDate, n)} />
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">
              {sorted.length === 0 ? (
                <div className="text-center py-16 px-10">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                    <Calendar size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Henüz bir devamsızlık kaydı girmedin.</p>
                </div>
              ) : sorted.map((rec) => {
                const session = sessions.find((s) => String(s.id) === String(rec.course_id));
                const key = recordKey(rec);
                const isEditing = editingKey === key;
                return (
                  <div key={key} className="space-y-2">
                    <button
                      onClick={() => setEditingKey(isEditing ? null : key)}
                      className={`w-full rounded-[24px] border px-5 py-4 flex items-center justify-between transition-all active:scale-[0.98] ${
                        isEditing ? "bg-white border-indigo-200 shadow-md ring-4 ring-indigo-50" : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-[14px] font-bold text-slate-900">{prettyTR(rec.date)}</div>
                        {session && (
                          <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                            <Clock size={10} /> {session.start} — {session.end}
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${isEditing ? "bg-indigo-600 text-white" : "bg-rose-50 text-rose-600"}`}>
                        {rec.missed_blocks} saat
                      </span>
                    </button>
                    {isEditing && session && (
                      <div className="p-4 rounded-[24px] bg-white border border-indigo-100 shadow-sm space-y-4 animate-in zoom-in-95 duration-200">
                        <label className="text-xs font-semibold text-slate-800 ml-1">Süreyi Değiştir</label>
                        <HourButtons blocks={session.blocks} current={rec.missed_blocks} onPick={(n) => save(rec.course_id, rec.date, n)} />
                        <button onClick={() => del(rec)} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition">
                          <Trash2 size={14} /> Kaydı Sil
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!addMode && (
          <div className="p-5 bg-white border-t border-slate-100 shrink-0">
            <button
              onClick={() => { setAddMode(true); setSelectedDate(null); setAddMonth({ year: now.getFullYear(), month: now.getMonth() }); scrollRef.current?.scrollTo(0, 0); }}
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
