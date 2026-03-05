export const SCHOOLS = [
  { value: "ieu", label: "İzmir Ekonomi Üniversitesi (IEU)" },
  { value: "deu", label: "Dokuz Eylül Üniversitesi" },
  { value: "ege", label: "Ege Üniversitesi" },
  { value: "iyte", label: "İzmir Yüksek Teknoloji Enstitüsü" },
  { value: "other", label: "Diğer Üniversite" },
] as const;

export type SchoolValue = (typeof SCHOOLS)[number]["value"];

export function isIEU(school: string | null | undefined): boolean {
  return !school || school === "ieu";
}

export function schoolLabel(value: string | null | undefined): string {
  return (
    SCHOOLS.find((s) => s.value === value)?.label ??
    "İzmir Ekonomi Üniversitesi (IEU)"
  );
}
