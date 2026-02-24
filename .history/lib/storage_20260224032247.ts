
import type { AttendanceMap, Course } from "./types";

export const LS_COURSES = "courses";
export const LS_ATT = "attendance_v1";

export function loadCourses(): Course[] {
  try {
    const raw = localStorage.getItem(LS_COURSES);
    return raw ? (JSON.parse(raw) as Course[]) : [];
  } catch {
    return [];
  }
}

export function saveCourses(courses: Course[]) {
  localStorage.setItem(LS_COURSES, JSON.stringify(courses));
}

export function loadAttendance(): AttendanceMap {
  try {
    const raw = localStorage.getItem(LS_ATT);
    return raw ? (JSON.parse(raw) as AttendanceMap) : {};
  } catch {
    return {};
  }
}

export function saveAttendance(map: AttendanceMap) {
  localStorage.setItem(LS_ATT, JSON.stringify(map));
}

// key helpers
export function courseKey(c: Course) {
  return c.id ?? `${c.courseName}|${c.day}|${c.start}|${c.end}|${c.blocks}`;
}

export function attKey(dateISO: string, c: Course) {
  return `${dateISO}|${courseKey(c)}`;
}