import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminRatelimit } from "@/lib/ratelimit";
import { isAdminEmail, getClientIp } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
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
