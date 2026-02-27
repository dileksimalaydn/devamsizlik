export type Course = {
  id: string; // Supabase'den her zaman id gelir
  user_id: string; // Kimin dersi olduğunu bilmemiz lazım
  course_name: string; // ✅ Alt tireli olmalı (DB ile aynı)
  day: string;
  start: string;
  end: string;
  blocks: number;
};

export type AttendanceMap = Record<string, number>;

export type AttendanceRecord = {
  course_id: string;
  date: string;
  missed_blocks: number;
};