// lib/normalize.ts
export function normalizeCourseName(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, ""); // boşlukları kaldır (SE 116 == se116)
}