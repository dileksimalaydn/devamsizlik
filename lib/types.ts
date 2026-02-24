export type Course = {
  id?: string;
  courseName: string;
  day: string; // "Pazartesi"...
  start: string; // "08:30"
  end: string; // "10:20"
  blocks: number; // 1,2,3...
};

export type AttendanceMap = Record<string, number>;