import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const admins = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

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
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdmin();

  const [{ data: authData, error: listError }, { data: coursesData }, { data: attendanceData }] =
    await Promise.all([
      admin.auth.admin.listUsers(),
      admin.from("courses").select("user_id"),
      admin.from("attendance").select("user_id"),
    ]);

  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  // Ders ve devamsızlık sayılarını hesapla
  const courseCount: Record<string, number> = {};
  for (const c of coursesData ?? []) {
    courseCount[c.user_id] = (courseCount[c.user_id] ?? 0) + 1;
  }
  const attendanceCount: Record<string, number> = {};
  for (const a of attendanceData ?? []) {
    attendanceCount[a.user_id] = (attendanceCount[a.user_id] ?? 0) + 1;
  }

  const users = authData.users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    course_count: courseCount[u.id] ?? 0,
    attendance_count: attendanceCount[u.id] ?? 0,
  }));

  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
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
