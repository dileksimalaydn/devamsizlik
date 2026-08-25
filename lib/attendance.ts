import type { Course } from "@/lib/types";

// IEU kuralı: teorik %30, lab %20 devamsızlık hakkı.
// WEEKS = gerçek ders haftası sayısı (vize/final haftaları hariç).
// 2026-2027 güz: ders başlangıcı 21 Eylül, vize 7-15 Kasım (1 hafta ders yok),
// final 4-13 Ocak (dönem dışı) → 15 takvim haftası - 1 vize haftası = 14.
// Yeni dönemde IEU akademik takviminden aynı mantıkla yeniden hesaplanmalı.
export const ATTENDANCE_WEEKS = 14;

type LimitInput = Pick<Course, "custom_limit" | "course_type" | "blocks">;

/**
 * Bir ders grubunun (aynı dersin farklı gün/saatlerdeki oturumları) devamsızlık
 * limitini hesaplar. Kullanıcı özel bir limit girmişse (0 dahil — "0 saat hakkım
 * var" geçerli bir tercihtir) onu kullanır, yoksa ders türüne göre otomatik
 * hesaplar. Özet sayfası ve günlük hatırlatma maili AYNI bu fonksiyonu kullanmalı,
 * yoksa ikisi farklı sayı söyler.
 */
export function calcLimit(sessions: LimitInput[]): number {
  const customLimits = sessions
    .map((s) => s.custom_limit)
    .filter((v): v is number => v !== null && v !== undefined && v >= 0);
  if (customLimits.length > 0) return customLimits[0];

  const type = sessions[0]?.course_type || "teorik";
  const ratio = type === "lab" ? 0.20 : 0.30;
  const totalBlocks = sessions.reduce((sum, s) => sum + s.blocks, 0);
  return Math.max(1, Math.round(totalBlocks * ATTENDANCE_WEEKS * ratio));
}

/**
 * missed/limit oranı. Limit 0 veya altındaysa (kullanıcı "0 saat hakkım var"
 * demişse) klasik bölme NaN/Infinity üretir — bunun yerine: hiç devamsızlık
 * yoksa 0 (henüz güvende), en az bir devamsızlık varsa 1 (limit dolmuş, en
 * yüksek risk) döner.
 */
export function riskRatio(missed: number, limit: number): number {
  if (limit <= 0) return missed > 0 ? 1 : 0;
  return missed / limit;
}

/**
 * Serbest metin olarak girilen özel devamsızlık limitini doğrular.
 * Boş string → limit yok (otomatik hesaplansın). Geçersiz/negatif değer → hata.
 */
export function parseCustomLimitInput(raw: string): { value: number | null; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return { value: null, error: "Devamsızlık limiti 0 veya daha büyük bir tam sayı olmalı." };
  }
  return { value: n, error: null };
}
