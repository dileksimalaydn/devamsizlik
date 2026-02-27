export type Course = {
  id: string;
  user_id: string;
  course_name: string;
  day: string;
  start: string;
  end: string;
  blocks: number;
  course_type: "teorik" | "lab"; // teorik: %30, lab: %20 devamsızlık hakkı
};

export type AttendanceMap = Record<string, number>;

export type AttendanceRecord = {
  course_id: string;
  date: string;
  missed_blocks: number;
};