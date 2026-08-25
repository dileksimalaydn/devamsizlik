import { normalizeCourseName } from "@/lib/normalize";

// Ders bazlı renk kodlaması — koyu tema için tasarlandı.
// `accent`: buton/çubuk zemini, üzerinde her zaman beyaz yazı var — bu yüzden
// her ton WCAG AA (≥4.5:1 beyaz yazı kontrastı) geçecek şekilde seçildi.
// `soft`+`text`: rozet/etiket kullanımı — koyu, hafif renkli zemin üzerinde
// parlak renkli yazı (ölçülmüş kontrast ≥5:1).
const palette = [
  { soft: "bg-indigo-500/15", accent: "bg-indigo-600", text: "text-indigo-300", ring: "ring-indigo-500/30" },
  { soft: "bg-rose-500/15", accent: "bg-rose-600", text: "text-rose-300", ring: "ring-rose-500/30" },
  { soft: "bg-amber-500/15", accent: "bg-amber-700", text: "text-amber-300", ring: "ring-amber-500/30" },
  { soft: "bg-emerald-500/15", accent: "bg-emerald-700", text: "text-emerald-300", ring: "ring-emerald-500/30" },
  { soft: "bg-sky-500/15", accent: "bg-sky-700", text: "text-sky-300", ring: "ring-sky-500/30" },
  { soft: "bg-fuchsia-500/15", accent: "bg-fuchsia-600", text: "text-fuchsia-300", ring: "ring-fuchsia-500/30" },
];

export function colorFor(name: string) {
  // Normalize edilmeden hash'lenirse "SE 116" ve "se116" (aynı ders, farklı
  // yazım) farklı renk alır — summary sayfası zaten bunları aynı ders olarak
  // gruplamıştı, renk de aynı mantıkla eşleşmeli.
  const key = normalizeCourseName(name);
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}
