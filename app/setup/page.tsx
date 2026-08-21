"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CourseCatalogPicker, { type TypedMeeting } from "@/components/CourseCatalogPicker";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/lib/types";
import { isIEU } from "@/lib/schools";
import { Search } from "lucide-react";

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}


export default function SetupPage() {
  const router = useRouter();
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const slotTimes = useMemo(() => {
    const first = toMinutes("08:30");
    const lastStart = toMinutes("21:20");
    const arr: string[] = [];
    for (let t = first; t <= lastStart; t += 55) arr.push(toHHMM(t));
    return arr;
  }, []);

  const [school, setSchool] = useState<string | null>(null);
  const [courseName, setCourseName] = useState("");
  const [day, setDay] = useState(DAYS[0]);
  const [start, setStart] = useState(slotTimes[0] ?? "08:30");
  const [blocks, setBlocks] = useState(1);
  const [lessonMin, setLessonMin] = useState(45);
  const [breakMin, setBreakMin] = useState(10);
  const [courseType, setCourseType] = useState<"teorik" | "lab">("teorik");
  const [customLimit, setCustomLimit] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const ieu = isIEU(school);
  const showManualForm = !ieu || manualMode;

  // Her iki mod için de bitiş otomatik hesaplanır
  const computedEnd = useMemo(() => {
    const slotLen = ieu ? 45 : lessonMin;
    const slotBreak = ieu ? 10 : breakMin;
    const total = blocks * slotLen + Math.max(0, blocks - 1) * slotBreak;
    return toHHMM(toMinutes(start) + total);
  }, [start, blocks, ieu, lessonMin, breakMin]);

  const effectiveEnd = computedEnd;

  const loadCourses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setMyCourses(data as Course[]);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("school")
        .eq("user_id", user.id)
        .single();
      setSchool(profile?.school ?? "ieu");
      await loadCourses();
    };
    init();
  }, []);

  const handleSave = async () => {
    const name = courseName.trim().toUpperCase();
    if (!name) {
      setSaveError("Ders adı boş olamaz.");
      return;
    }

    const endStr = effectiveEnd.substring(0, 5);
    const startStr = start.substring(0, 5);
    const finalBlocks = blocks;

    // Çakışma kontrolü (dakika bazlı, IEU ve diğer için aynı)
    const newStartMin = toMinutes(startStr);
    const newEndMin = toMinutes(endStr);

    const collision = myCourses.find((existing) => {
      if (existing.day !== day) return false;
      const existStart = toMinutes(existing.start.substring(0, 5));
      const existEnd = toMinutes(existing.end.substring(0, 5));
      return newStartMin < existEnd && newEndMin > existStart;
    });

    if (collision) {
      setSaveError(`Bu saatlerde zaten "${collision.course_name}" dersin var.`);
      return;
    }

    setSaveError(null);
    setSaving(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("courses").insert({
      id: crypto.randomUUID(),
      user_id: userData.user.id,
      course_name: name,
      day,
      start: startStr,
      end: endStr,
      blocks: finalBlocks,
      course_type: courseType,
      custom_limit: customLimit ? parseInt(customLimit) : null,
    });

    setSaving(false);

    if (error) {
      setSaveError("Kayıt sırasında hata oluştu: " + error.message);
      return;
    }

    setCourseName("");
    setBlocks(1);
    setLessonMin(45);
    setBreakMin(10);
    setCourseType("teorik");
    setCustomLimit("");
    loadCourses();
  };

  const handleDelete = async (id: string | number) => {
    await supabase.from("courses").delete().eq("id", id);
    setDeletingId(null);
    loadCourses();
  };

  const handleCatalogAdd = async (
    course: { code: string; name: string },
    meetings: TypedMeeting[],
    customLimit: number | null
  ): Promise<{ error?: string }> => {
    // Aynı section içindeki günlerin kendi aralarında çakışıp çakışmadığı
    const withinBatch = meetings.find((m, i) =>
      meetings.some((other, j) => {
        if (i === j || other.day !== m.day) return false;
        const aStart = toMinutes(m.start), aEnd = toMinutes(m.end);
        const bStart = toMinutes(other.start), bEnd = toMinutes(other.end);
        return aStart < bEnd && aEnd > bStart;
      })
    );
    if (withinBatch) {
      return { error: "Bu section'ın kendi günleri çakışıyor gibi görünüyor, kataloğu kontrol et." };
    }

    // Mevcut derslerle çakışma kontrolü (her gün için)
    for (const m of meetings) {
      const newStartMin = toMinutes(m.start);
      const newEndMin = toMinutes(m.end);
      const collision = myCourses.find((existing) => {
        if (existing.day !== m.day) return false;
        const existStart = toMinutes(existing.start.substring(0, 5));
        const existEnd = toMinutes(existing.end.substring(0, 5));
        return newStartMin < existEnd && newEndMin > existStart;
      });
      if (collision) {
        return { error: `${m.day} ${m.start}–${m.end} saatinde zaten "${collision.course_name}" dersin var.` };
      }
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      router.push("/login");
      return { error: "Oturum bulunamadı, tekrar giriş yapman gerekiyor." };
    }

    const name = course.code.trim().toUpperCase();
    const rows = meetings.map((m) => ({
      id: crypto.randomUUID(),
      user_id: userData.user.id,
      course_name: name,
      day: m.day,
      start: m.start,
      end: m.end,
      blocks: m.blocks,
      course_type: m.type,
      custom_limit: customLimit,
    }));

    const { error } = await supabase.from("courses").insert(rows);
    if (error) {
      return { error: "Kayıt sırasında hata oluştu: " + error.message };
    }

    await loadCourses();
    return {};
  };

  const field =
    "w-full rounded-2xl border border-border bg-muted/30 px-3 py-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:bg-background focus:border-ring focus:ring-4 focus:ring-ring/10 transition";

  if (school === null) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      <AppHeader
        right={
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition"
          >
            Bitti
          </button>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">
        {!showManualForm && (
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full rounded-3xl bg-card p-5 shadow-sm border border-border flex items-center gap-3 hover:border-primary/30 transition text-left"
          >
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-violet-300">
              <Search size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground">Ders Ekle</div>
              <div className="text-xs font-medium text-muted-foreground">Kod veya ad ile IEU kataloğundan ara</div>
            </div>
          </button>
        )}

        {showManualForm && (
        <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-foreground">Yeni Ders Tanımla</div>
            {ieu && (
              <button
                onClick={() => setManualMode(false)}
                className="text-[11px] font-semibold text-violet-300 hover:underline"
              >
                Kataloğdan seç
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Ders Adı</label>
              <input
                type="text"
                placeholder="Örn: se116"
                value={courseName}
                onChange={(e) => { setCourseName(e.target.value.toUpperCase()); setSaveError(null); }}
                className={field}
              />
            </div>

            {/* Teorik / Lab toggle */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Ders Türü</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCourseType("teorik")}
                  className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
                    courseType === "teorik"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border"
                  }`}
                >
                  Teorik
                  <span className="block text-[10px] font-normal opacity-70">%30 devamsızlık hakkı</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCourseType("lab")}
                  className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
                    courseType === "lab"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border"
                  }`}
                >
                  Lab / Uygulama
                  <span className="block text-[10px] font-normal opacity-70">%20 devamsızlık hakkı</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Gün</label>
                <select value={day} onChange={(e) => setDay(e.target.value)} className={field}>
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Başlangıç</label>
                {ieu ? (
                  <select value={start} onChange={(e) => setStart(e.target.value)} className={field}>
                    {slotTimes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                ) : (
                  <input
                    type="time"
                    value={start}
                    onChange={(e) => { setStart(e.target.value); setSaveError(null); }}
                    className={field}
                  />
                )}
              </div>
            </div>

            {!ieu && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Ders süresi (dk)</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonMin}
                    onChange={(e) => { setLessonMin(Number(e.target.value)); setSaveError(null); }}
                    className={field}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Mola (dk)</label>
                  <input
                    type="number"
                    min={0}
                    value={breakMin}
                    onChange={(e) => { setBreakMin(Number(e.target.value)); setSaveError(null); }}
                    className={field}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Ders Saati</label>
                <select value={blocks} onChange={(e) => setBlocks(Number(e.target.value))} className={field}>
                  {[1, 2, 3, 4, 5, 6].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Bitiş</label>
                <div className="rounded-2xl border border-border bg-muted/30 px-3 py-3 text-sm">
                  <div className="font-bold text-foreground">{computedEnd}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Otomatik hesaplanır</div>
                </div>
              </div>
            </div>

            {/* Özel limit */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Devamsızlık Limiti (saat)
                <span className="ml-1 font-normal text-muted-foreground">— boş bırakırsan otomatik hesaplanır</span>
              </label>
              <input
                type="number"
                min={1}
                placeholder="Örn: 6"
                value={customLimit}
                onChange={(e) => { setCustomLimit(e.target.value); setSaveError(null); }}
                className={field}
              />
            </div>

            {/* Hata mesajı */}
            {saveError && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {saveError}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition active:scale-95 disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet ve Listeye Ekle"}
            </button>
          </div>
        </div>
        )}

        {/* Ders listesi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Programındaki Dersler
            </h3>
            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {myCourses.length} Ders
            </span>
          </div>

          {myCourses.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground text-xs font-medium">
              Henüz ders eklenmedi.
            </div>
          ) : (
            myCourses.map((c) => (
              <div
                key={c.id}
                className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">{c.course_name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        c.course_type === "lab"
                          ? "bg-violet-500/15 text-violet-300"
                          : "bg-sky-500/15 text-sky-300"
                      }`}>
                        {c.course_type === "lab" ? "LAB" : "TEORİK"}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">
                      {c.day} • {c.start} – {c.end}
                      {ieu && ` (${c.blocks} saat)`}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeletingId(String(c.id))}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Satır içi silme onayı */}
                {deletingId === String(c.id) && (
                  <div className="flex items-center justify-between gap-2 border-t border-rose-500/20 bg-rose-500/10 px-4 py-3">
                    <span className="text-xs font-semibold text-rose-300">
                      Bu dersi silmek istediğine emin misin?
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="rounded-xl bg-background border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => c.id && handleDelete(c.id)}
                        className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {ieu && (
        <CourseCatalogPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onManualFallback={() => setManualMode(true)}
          onAdd={handleCatalogAdd}
        />
      )}

      <BottomNav />
    </main>
  );
}
