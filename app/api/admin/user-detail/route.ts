import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { adminRatelimit } from "@/lib/ratelimit";

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const admins = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await adminRatelimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || !isAdminEmail(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { data: courses } = await admin
    .from("courses")
    .select("course_name, day, start, end, blocks, course_type")
    .eq("user_id", userId)
    .order("day");

  return NextResponse.json({ courses: courses ?? [] });
}
