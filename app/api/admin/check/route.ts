import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ isAdmin: false });
  }

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  return NextResponse.json({ isAdmin: isAdminEmail(user?.email) });
}
