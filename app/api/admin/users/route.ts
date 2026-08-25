import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { adminRatelimit } from "@/lib/ratelimit";
import { isAdminEmail, getClientIp } from "@/lib/admin";

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || !isAdminEmail(user.email)) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await adminRatelimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdmin();

  const [{ data: coursesData }, { data: attendanceData }, { data: profilesData }] = await Promise.all([
    admin.from("courses").select("user_id"),
    admin.from("attendance").select("user_id"),
    admin.from("profiles").select("user_id, school"),
  ]);

  const allUsers = [];
  let page = 1;
  while (true) {
    const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
    allUsers.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }

  // Ders ve devamsızlık sayılarını hesapla
  const courseCount: Record<string, number> = {};
  for (const c of coursesData ?? []) {
    courseCount[c.user_id] = (courseCount[c.user_id] ?? 0) + 1;
  }
  const attendanceCount: Record<string, number> = {};
  for (const a of attendanceData ?? []) {
    attendanceCount[a.user_id] = (attendanceCount[a.user_id] ?? 0) + 1;
  }
  const schoolMap: Record<string, string> = {};
  for (const p of profilesData ?? []) {
    schoolMap[p.user_id] = p.school ?? "ieu";
  }

  const users = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    course_count: courseCount[u.id] ?? 0,
    attendance_count: attendanceCount[u.id] ?? 0,
    school: schoolMap[u.id] ?? null,
  }));

  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await adminRatelimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
