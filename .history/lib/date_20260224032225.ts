export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, amount: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + amount);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dayNameTR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const map = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return map[d.getDay()];
}

function capitalizeTR(s: string) {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
}

export function prettyTR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(d);
  const dm = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long" }).format(d);
  return `${capitalizeTR(weekday)}, ${dm}`;
}