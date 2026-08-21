// IEU ders kataloğu — public/data/ieu-catalog.json içinden okunur.
// Yeni dönemde scripts/build-ieu-catalog.py tekrar çalıştırılıp o dosya
// güncellenir, burada değişiklik gerekmez.

export type CatalogMeeting = {
  day: string;
  start: string;
  end: string;
  blocks: number;
};

export type CatalogSection = {
  section: string;
  instructor: string;
  meetings: CatalogMeeting[];
};

export type CatalogCourse = {
  code: string;
  name: string;
  sections: CatalogSection[];
};

export type Catalog = {
  term: string;
  source: string;
  courseCount: number;
  catalog: CatalogCourse[];
};

let cache: Catalog | null = null;
let inflight: Promise<Catalog> | null = null;

export async function fetchCatalog(): Promise<Catalog> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch("/data/ieu-catalog.json")
    .then((res) => {
      if (!res.ok) throw new Error("Katalog yüklenemedi");
      return res.json();
    })
    .then((data: Catalog) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

function norm(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, "");
}

export function searchCatalog(catalog: CatalogCourse[], query: string, limit = 30): CatalogCourse[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const results = catalog.filter(
    (c) => norm(c.code).includes(q) || c.name.toLocaleLowerCase("tr-TR").includes(query.trim().toLocaleLowerCase("tr-TR"))
  );
  // Kod tam eşleşmesi/başlangıcı önce gelsin
  results.sort((a, b) => {
    const aStarts = norm(a.code).startsWith(q) ? 0 : 1;
    const bStarts = norm(b.code).startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.code.localeCompare(b.code, "tr-TR");
  });
  return results.slice(0, limit);
}
