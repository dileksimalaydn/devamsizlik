#!/usr/bin/env python3
"""
IEU'nun "TÜM SECTIONLAR" excel'ini (timetable exportu) uygulamanın kullandığı
küçük bir JSON kataloğuna çevirir.

Kullanım:
  python3 scripts/build-ieu-catalog.py /path/to/IEU_...SECTION.xlsx

Her dönem yeni excel geldiğinde bu script tekrar çalıştırılıp
public/data/ieu-catalog.json üzerine yazılır — uygulama kodunda değişiklik
gerekmez, tek kaynak bu JSON dosyasıdır.

Beklenen sheet: "HER GÜN-SAAT AYRI" — her ders/section/gün için ayrı satır
(Ders Kodu, Ders Adı, Section, Hoca, Gün, Saat, Derslik, AKTS).

Saat aralığından blok (ders saati) sayısı, IEU'nun 45dk ders + 10dk mola
düzenine göre cebirsel olarak çıkarılır: blocks = round((dakika + 10) / 55).
Bu, app/setup sayfasındaki slot üretimiyle (55dk adım) birebir tutarlıdır.
"""
import sys
import re
import json
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
SHEET_NAME = "HER GÜN-SAAT AYRI"


def col_to_num(col: str) -> int:
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n


def load_shared_strings(z: zipfile.ZipFile):
    try:
        tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    out = []
    for si in tree.findall("x:si", NS):
        out.append("".join(t.text or "" for t in si.findall(".//x:t", NS)))
    return out


def find_sheet_file(z: zipfile.ZipFile, sheet_name: str) -> str:
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    rel_ns = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
    rid_to_target = {
        r.get("Id"): r.get("Target") for r in rels.findall("r:Relationship", rel_ns)
    }
    r_ns = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
    for sheet in wb.findall(".//x:sheet", NS):
        if sheet.get("name") == sheet_name:
            target = rid_to_target[sheet.get(r_ns)]
            target = target.lstrip("/")
            return target if target.startswith("xl/") else "xl/" + target
    raise ValueError(f'Sheet "{sheet_name}" bulunamadı. Mevcut sheetler: '
                      + ", ".join(s.get("name") for s in wb.findall(".//x:sheet", NS)))


def parse_sheet(z: zipfile.ZipFile, sheet_file: str, sst: list[str]):
    tree = ET.fromstring(z.read(sheet_file))
    rows = []
    for row in tree.findall(".//x:row", NS):
        cells = {}
        for c in row.findall("x:c", NS):
            ref = c.get("r")
            col_letters = re.match(r"([A-Z]+)", ref).group(1)
            colnum = col_to_num(col_letters)
            t = c.get("t")
            v_el = c.find("x:v", NS)
            val = v_el.text if v_el is not None else ""
            if t == "s" and val != "":
                val = sst[int(val)]
            cells[colnum] = val
        maxc = max(cells.keys()) if cells else 0
        rows.append([cells.get(i, "") for i in range(1, maxc + 1)])
    return rows


def to_minutes(hhmm: str) -> int:
    h, m = hhmm.strip().split(":")
    return int(h) * 60 + int(m)


def build(xlsx_path: str, out_path: str):
    z = zipfile.ZipFile(xlsx_path)
    sst = load_shared_strings(z)
    sheet_file = find_sheet_file(z, SHEET_NAME)
    rows = parse_sheet(z, sheet_file, sst)

    header = rows[0]
    data = rows[1:]

    courses: dict[str, dict] = {}
    skipped = 0
    for r in data:
        if len(r) < 6:
            skipped += 1
            continue
        code, name, section, instructor, day, saat = r[0], r[1], r[2], r[3], r[4], r[5]
        if not code or not day or not saat or "-" not in saat:
            skipped += 1
            continue
        try:
            start_s, end_s = [s.strip() for s in saat.split("-")]
            dur = to_minutes(end_s) - to_minutes(start_s)
            blocks = round((dur + 10) / 55)
            if blocks < 1:
                raise ValueError("blocks < 1")
        except Exception:
            skipped += 1
            continue

        key = code.strip()
        course = courses.setdefault(key, {
            "code": key,
            "name": (name or "").strip(),
            "sections": {},
        })
        sec = course["sections"].setdefault(section, {
            "section": section,
            "instructor": (instructor or "").strip(),
            "meetings": [],
        })
        sec["meetings"].append({"day": day, "start": start_s, "end": end_s, "blocks": blocks})

    catalog = []
    for c in courses.values():
        c["sections"] = sorted(c["sections"].values(), key=lambda s: s["section"])
        for s in c["sections"]:
            s["meetings"].sort(key=lambda m: (m["day"], m["start"]))
        catalog.append(c)
    catalog.sort(key=lambda c: c["code"])

    out = {
        "term": "2026-2027-fall",
        "source": Path(xlsx_path).name,
        "courseCount": len(catalog),
        "catalog": catalog,
    }

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    print(f"{len(catalog)} ders, {sum(len(c['sections']) for c in catalog)} section yazıldı -> {out_path}")
    print(f"atlanan satır: {skipped}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanım: python3 scripts/build-ieu-catalog.py <xlsx-yolu> [çıktı-json-yolu]")
        sys.exit(1)
    xlsx_path = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else str(
        Path(__file__).resolve().parent.parent / "public" / "data" / "ieu-catalog.json"
    )
    build(xlsx_path, out_path)
