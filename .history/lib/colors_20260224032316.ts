const palette = [
  { soft: "bg-sky-50", accent: "bg-sky-400", text: "text-sky-700", ring: "ring-sky-200" },
  { soft: "bg-pink-50", accent: "bg-pink-400", text: "text-pink-700", ring: "ring-pink-200" },
  { soft: "bg-orange-50", accent: "bg-orange-400", text: "text-orange-700", ring: "ring-orange-200" },
  { soft: "bg-violet-50", accent: "bg-violet-400", text: "text-violet-700", ring: "ring-violet-200" },
  { soft: "bg-emerald-50", accent: "bg-emerald-400", text: "text-emerald-700", ring: "ring-emerald-200" },
];

export function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}