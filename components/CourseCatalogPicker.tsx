"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, ChevronLeft, User, Clock, Check, Loader2 } from "lucide-react";
import { fetchCatalog, searchCatalog, type CatalogCourse, type CatalogSection, type CatalogMeeting } from "@/lib/catalog";
import { parseCustomLimitInput } from "@/lib/attendance";

export type TypedMeeting = CatalogMeeting & { type: "teorik" | "lab" };

type Props = {
  open: boolean;
  onClose: () => void;
  onManualFallback: () => void;
  onAdd: (
    course: { code: string; name: string },
    meetings: TypedMeeting[],
    customLimit: number | null
  ) => Promise<{ error?: string }>;
};

export default function CourseCatalogPicker({ open, onClose, onManualFallback, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [allCourses, setAllCourses] = useState<CatalogCourse[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CatalogCourse | null>(null);
  const [selectedSection, setSelectedSection] = useState<CatalogSection | null>(null);
  const [meetingTypes, setMeetingTypes] = useState<("teorik" | "lab")[]>([]);
  const [customLimit, setCustomLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || allCourses) return;
    fetchCatalog()
      .then((data) => setAllCourses(data.catalog))
      .catch(() => setLoadError("Ders kataloğu yüklenemedi. İnternet bağlantını kontrol et."));
  }, [open, allCourses]);

  const handleClose = () => {
    setQuery("");
    setSelectedCourse(null);
    setSelectedSection(null);
    setMeetingTypes([]);
    setCustomLimit("");
    setSaveError(null);
    onClose();
  };

  const pickSection = (s: CatalogSection) => {
    setSelectedSection(s);
    setMeetingTypes(s.meetings.map(() => "teorik"));
  };

  const setMeetingType = (index: number, type: "teorik" | "lab") => {
    setMeetingTypes((prev) => prev.map((t, i) => (i === index ? type : t)));
  };

  const results = useMemo(() => {
    if (!allCourses) return [];
    return searchCatalog(allCourses, query);
  }, [allCourses, query]);

  if (!open) return null;

  const step: "search" | "sections" | "confirm" = selectedSection
    ? "confirm"
    : selectedCourse
    ? "sections"
    : "search";

  const back = () => {
    setSaveError(null);
    if (step === "confirm") setSelectedSection(null);
    else if (step === "sections") setSelectedCourse(null);
  };

  const handleAdd = async () => {
    if (!selectedCourse || !selectedSection) return;

    const isMixedType = new Set(meetingTypes).size > 1;
    const { value: parsedLimit, error: limitError } = isMixedType
      ? { value: null, error: null }
      : parseCustomLimitInput(customLimit);
    if (limitError) {
      setSaveError(limitError);
      return;
    }

    setSaving(true);
    setSaveError(null);
    const meetings: TypedMeeting[] = selectedSection.meetings.map((m, i) => ({
      ...m,
      type: meetingTypes[i] ?? "teorik",
    }));
    const res = await onAdd({ code: selectedCourse.code, name: selectedCourse.name }, meetings, parsedLimit);
    setSaving(false);
    if (res.error) {
      setSaveError(res.error);
      return;
    }
    setSelectedCourse(null);
    setSelectedSection(null);
    setQuery("");
    setCustomLimit("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-[32px] bg-card shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {step !== "search" && (
              <button
                onClick={back}
                className="h-9 w-9 shrink-0 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground leading-tight truncate">
                {step === "search" && "Ders Ara"}
                {step === "sections" && selectedCourse?.code}
                {step === "confirm" && "Bu Section Eklensin mi?"}
              </h2>
              <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
                {step === "search" && "IEU güz dönemi ders kataloğu"}
                {step === "sections" && selectedCourse?.name}
                {step === "confirm" && `${selectedCourse?.code} — Section ${selectedSection?.section}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-9 w-9 shrink-0 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* İçerik */}
        <div className="overflow-y-auto flex-1 bg-background/30">
          {step === "search" && (
            <div className="px-5 py-4 space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ders kodu veya adı — örn: SE 116"
                  className="w-full rounded-2xl border border-border bg-muted/30 pl-10 pr-3 py-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:bg-background focus:border-ring focus:ring-4 focus:ring-ring/10 transition"
                />
              </div>

              {loadError && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-300">
                  {loadError}
                </div>
              )}

              {!allCourses && !loadError && (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-xs font-medium">
                  <Loader2 size={16} className="animate-spin" /> Katalog yükleniyor...
                </div>
              )}

              {allCourses && query.trim().length < 2 && (
                <div className="py-10 text-center text-xs font-medium text-muted-foreground px-6">
                  Aramak için en az 2 karakter yaz. 1150+ ders arasından kodu veya adıyla bulabilirsin.
                </div>
              )}

              {allCourses && query.trim().length >= 2 && results.length === 0 && (
                <div className="py-10 text-center text-xs font-medium text-muted-foreground px-6">
                  &quot;{query}&quot; ile eşleşen ders bulunamadı.
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-2">
                  {results.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCourse(c)}
                      className="w-full text-left rounded-2xl border border-border bg-card px-4 py-3 hover:border-primary/30 hover:bg-muted/30 transition active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-foreground">{c.code}</span>
                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                          {c.sections.length} section
                        </span>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-0.5 truncate">{c.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "sections" && selectedCourse && (
            <div className="px-5 py-4 space-y-2">
              {selectedCourse.sections.map((s) => (
                <button
                  key={s.section}
                  onClick={() => pickSection(s)}
                  className="w-full text-left rounded-2xl border border-border bg-card px-4 py-3 hover:border-primary/30 hover:bg-muted/30 transition active:scale-[0.98] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-foreground">Section {s.section}</span>
                  </div>
                  {s.instructor && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <User size={11} /> {s.instructor}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    {s.meetings.map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <Clock size={11} /> {m.day} · {m.start}–{m.end} · {m.blocks} saat
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "confirm" && selectedCourse && selectedSection && (() => {
            const isMixedType = new Set(meetingTypes).size > 1;
            return (
            <div className="px-5 py-4 space-y-4">
              {selectedSection.instructor && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1">
                  <User size={12} /> {selectedSection.instructor}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Her gün için ders türü
                  {selectedSection.meetings.length > 1 && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      — bu dersin hangi günü teorik, hangi günü lab, sen işaretle
                    </span>
                  )}
                </label>
                <div className="space-y-2">
                  {selectedSection.meetings.map((m, i) => {
                    const type = meetingTypes[i] ?? "teorik";
                    return (
                      <div key={i} className="rounded-2xl border border-border bg-card p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Clock size={12} className="text-muted-foreground" /> {m.day} · {m.start}–{m.end} · {m.blocks} saat
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMeetingType(i, "teorik")}
                            className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                              type === "teorik"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/50 text-muted-foreground border-border"
                            }`}
                          >
                            Teorik
                            <span className="block text-[9px] font-normal opacity-70">%30 hak</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMeetingType(i, "lab")}
                            className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                              type === "lab"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/50 text-muted-foreground border-border"
                            }`}
                          >
                            Lab / Uygulama
                            <span className="block text-[9px] font-normal opacity-70">%20 hak</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Katalogda ders türü bilgisi yok, bunu sen seçiyorsun — sonra ders listesinden değiştiremezsin, yanlışsa silip tekrar ekle.
                </p>
              </div>

              {isMixedType ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[11px] font-medium text-amber-300">
                  Bu ders hem teorik hem lab günü içerdiği için elle limit girilemiyor — her gün kendi yüzdesine göre ayrı hesaplanacak. Hoca ikisi için de tek bir sayı söylediyse, günlerin ikisini de aynı tipte işaretle.
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Devamsızlık Limiti (saat)
                    <span className="ml-1 font-normal text-muted-foreground">— boş bırakırsan otomatik hesaplanır</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Hoca farklı bir sayı söylediyse buraya yaz — örn: 13"
                    value={customLimit}
                    onChange={(e) => { setCustomLimit(e.target.value); setSaveError(null); }}
                    className="w-full rounded-2xl border border-border bg-muted/30 px-3 py-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:bg-background focus:border-ring focus:ring-4 focus:ring-ring/10 transition"
                  />
                </div>
              )}

              {saveError && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-300">
                  {saveError}
                </div>
              )}
            </div>
            );
          })()}
        </div>

        {/* Footer */}
        {step === "confirm" ? (
          <div className="p-5 bg-card border-t border-border shrink-0">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
              {saving ? "Ekleniyor..." : "Programa Ekle"}
            </button>
          </div>
        ) : (
          <div className="p-5 bg-card border-t border-border shrink-0">
            <button
              onClick={() => {
                onManualFallback();
                handleClose();
              }}
              className="w-full rounded-2xl bg-muted py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition"
            >
              Kataloğda bulamadım, elle ekleyeceğim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
