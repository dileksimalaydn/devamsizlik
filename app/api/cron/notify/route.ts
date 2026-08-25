import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import type { Course } from "@/lib/types";
import { calcLimit, riskRatio } from "@/lib/attendance";
import { normalizeCourseName } from "@/lib/normalize";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function safeAppUrl(raw: string | undefined): string {
  try {
    const url = new URL(raw ?? "");
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("invalid protocol");
    }
    return url.toString();
  } catch {
    return "https://yoklama.vercel.app";
  }
}

const TURKISH_DAYS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

type WarningGroup = {
  displayName: string;
  missed: number;
  limit: number;
};

/**
 * Aynı dersin farklı gün/saatlerdeki oturumlarını (ör. Pazartesi + Çarşamba)
 * tek grupta toplayıp özel limiti/otomatik limiti hesaplar — özet sayfasıyla
 * (app/summary/page.tsx) BİREBİR aynı mantık, yoksa uygulama ve mail farklı
 * sayı söyler.
 */
function buildWarningGroups(
  courses: Course[],
  missedByCourse: Record<string, number>
): WarningGroup[] {
  // Elle özel limit girilen dersler: teorik/lab günleri ayrı gruplanırsa aynı
  // sayı ikisine de tekrar tekrar uygulanır. Bu yüzden elle limitli bir
  // dersin TÜM günleri tek grupta birleşir — özet sayfasıyla (app/summary/
  // page.tsx) BİREBİR aynı mantık.
  const hasCustomLimitByName = new Set<string>();
  for (const c of courses) {
    if (c.custom_limit !== null && c.custom_limit !== undefined && c.custom_limit >= 0) {
      hasCustomLimitByName.add(normalizeCourseName(c.course_name));
    }
  }
  const keyFor = (c: Course) => {
    const nameKey = normalizeCourseName(c.course_name);
    return hasCustomLimitByName.has(nameKey) ? nameKey : nameKey + ":" + (c.course_type || "teorik");
  };

  const groups: Record<string, { displayName: string; missed: number; sessions: Course[] }> = {};

  for (const c of courses) {
    const key = keyFor(c);
    if (!groups[key]) {
      groups[key] = { displayName: c.course_name, missed: 0, sessions: [] };
    }
    groups[key].sessions.push(c);
    groups[key].missed += missedByCourse[c.id] || 0;
  }

  return Object.values(groups)
    .map((g) => ({
      displayName: g.displayName,
      missed: g.missed,
      limit: calcLimit(g.sessions),
    }))
    .filter((g) => riskRatio(g.missed, g.limit) >= 0.7);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET env değişkeni tanımlı değil");
    return new Response("Unauthorized", { status: 401 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  const equal =
    authHeader.length === expected.length &&
    timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));

  if (!equal) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dayIndex = today.getDay(); // 0=Pazar, 6=Cumartesi
  const isWeekend = dayIndex === 0 || dayIndex === 6;
  const todayDay = TURKISH_DAYS[dayIndex];

  const users = [];
  let page = 1;
  while (true) {
    const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (usersError) {
      console.error("Kullanıcılar alınamadı:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
    users.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  const appUrl = safeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const fromEmail =
    process.env.FROM_EMAIL ?? "Devamsızlık <bildirim@devamsizlik.app>";

  for (const user of users) {
    if (!user.email) continue;

    try {
      const { data: allCourses } = await supabaseAdmin
        .from("courses")
        .select("*")
        .eq("user_id", user.id);

      if (!allCourses || allCourses.length === 0) {
        skipped++;
        continue;
      }

      const todayCourses = isWeekend
        ? []
        : (allCourses as Course[]).filter((c) => c.day === todayDay);

      const { data: attendanceRecords } = await supabaseAdmin
        .from("attendance")
        .select("course_id, missed_blocks")
        .eq("user_id", user.id);

      const missedByCourse: Record<string, number> = {};
      for (const record of attendanceRecords || []) {
        missedByCourse[record.course_id] =
          (missedByCourse[record.course_id] || 0) + record.missed_blocks;
      }

      const warningGroups = buildWarningGroups(allCourses as Course[], missedByCourse);

      // Hafta içi: ders yoksa ve uyarı da yoksa atla
      // Hafta sonu: her zaman gönder (hafta sonu hatırlatması)
      if (
        !isWeekend &&
        todayCourses.length === 0 &&
        warningGroups.length === 0
      ) {
        skipped++;
        continue;
      }

      const subject = buildSubject(todayCourses, warningGroups, isWeekend);
      const html = buildEmailHtml({
        todayCourses,
        warningGroups,
        todayDay,
        todayStr,
        appUrl,
        isWeekend,
      });
      const text = buildEmailText({
        todayCourses,
        warningGroups,
        todayDay,
        todayStr,
        appUrl,
        isWeekend,
      });

      // idempotencyKey: Vercel cron aynı günü tekrar tetiklerse (retry/timeout)
      // Resend aynı isteği ikinci kez işlemez — kullanıcı aynı gün iki mail almaz.
      const idempotencyKey = `notify-${user.id}-${todayStr}`;
      const { data: emailData, error: emailError } = await resend.emails.send(
        {
          from: fromEmail,
          to: user.email,
          subject,
          html,
          text,
          headers: {
            "X-Entity-Ref-ID": idempotencyKey,
          },
        },
        { idempotencyKey }
      );

      if (emailError) {
        console.error(`Mail gönderilemedi [${user.email}]:`, emailError);
        errors++;
        continue;
      }

      console.log(`Mail gönderildi [${user.email}]: ${emailData?.id}`);
      sent++;
    } catch (err) {
      console.error(`Kullanıcı ${user.id} için hata:`, err);
      errors++;
    }
  }

  return NextResponse.json({ success: true, sent, skipped, errors });
}

/**
 * ✅ VERCEL CRON POST ATTIĞI İÇİN:
 * POST gelince de aynen GET fonksiyonunu çalıştırıyoruz.
 */
export const POST = GET;

function buildSubject(
  todayCourses: Course[],
  warningGroups: WarningGroup[],
  isWeekend: boolean
): string {
  if (isWeekend) {
    if (warningGroups.length > 0) {
      return `Hafta sonu — ${warningGroups.length} dersinde devamsızlık sınırına yaklaşıyorsun`;
    }
    return "Hafta sonu — devamsızlıklarını güncelledin mi?";
  }
  if (warningGroups.length > 0 && todayCourses.length > 0) {
    return `Devamsızlık uyarısı + bugün ${todayCourses.length} ders var`;
  }
  if (warningGroups.length > 0) {
    return `${warningGroups.length} dersinde devamsızlık sınırına yaklaşıyorsun`;
  }
  return `Bugün ${todayCourses.length} ders var — devamsızlık kaydettin mi?`;
}

function buildEmailText({
  todayCourses,
  warningGroups,
  todayDay,
  todayStr,
  appUrl,
  isWeekend,
}: {
  todayCourses: Course[];
  warningGroups: WarningGroup[];
  todayDay: string;
  todayStr: string;
  appUrl: string;
  isWeekend: boolean;
}): string {
  const lines: string[] = ["Devamsızlık — Günlük Hatırlatma", ""];

  if (isWeekend) {
    lines.push("Hafta sonu! Bu hafta devamsızlık yaşadıysan kaydetmeyi unutma.");
    lines.push("");
  }

  if (warningGroups.length > 0) {
    lines.push("DEVAMSIZLIK UYARISI");
    for (const g of warningGroups) {
      const remaining = Math.max(0, g.limit - g.missed);
      lines.push(
        `- ${g.displayName}: ${g.missed}/${g.limit} saat (${remaining} saat kaldı)`
      );
    }
    lines.push("");
  }

  if (todayCourses.length > 0) {
    lines.push(`BUGUNKU DERSLER — ${todayDay}, ${todayStr}`);
    for (const c of todayCourses) {
      lines.push(`- ${c.course_name}: ${c.start} – ${c.end}`);
    }
    lines.push("");
  }

  lines.push(`Uygulamayı aç: ${appUrl}`);
  return lines.join("\n");
}

function buildEmailHtml({
  todayCourses,
  warningGroups,
  todayDay,
  todayStr,
  appUrl,
  isWeekend,
}: {
  todayCourses: Course[];
  warningGroups: WarningGroup[];
  todayDay: string;
  todayStr: string;
  appUrl: string;
  isWeekend: boolean;
}): string {
  const dateLabel = new Date(todayStr + "T12:00:00").toLocaleDateString(
    "tr-TR",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const font = `'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif`;

  let content = "";

  if (isWeekend) {
    content += `
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:20px;border-radius:8px;margin-bottom:20px;">
      <h2 style="margin:0 0 4px;color:#15803d;font-size:16px;font-family:${font};">Hafta Sonu Hatırlatması</h2>
      <p style="margin:0;color:#6b7280;font-size:13px;font-family:${font};">
        ${todayDay}, ${dateLabel} — Bu hafta devamsızlık yaşadıysan kaydetmeyi unutma.
      </p>
    </div>`;
  }

  if (warningGroups.length > 0) {
    const rows = warningGroups
      .map((g) => {
        const missed = g.missed;
        const limit = g.limit;
        const remaining = Math.max(0, limit - missed);
        const pct = Math.min(100, Math.round(riskRatio(missed, limit) * 100));
        const name = escapeHtml(g.displayName);
        return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #fed7aa;">
            <div style="color:#111827;font-size:14px;font-weight:600;font-family:${font};">${name}</div>
            <div style="color:#9a3412;font-size:13px;margin-top:3px;font-family:${font};">
              ${missed} / ${limit} saat kullanıldı — <strong>${remaining} saat kaldı</strong>
            </div>
            <div style="background:#fed7aa;border-radius:4px;height:6px;margin-top:8px;overflow:hidden;">
              <div style="background:#f97316;width:${pct}%;height:100%;border-radius:4px;"></div>
            </div>
          </td>
        </tr>`;
      })
      .join("");

    content += `
    <div style="background:#fff7ed;border-left:4px solid #f97316;padding:20px;border-radius:8px;margin-bottom:20px;">
      <h2 style="margin:0 0 4px;color:#c2410c;font-size:16px;font-family:${font};">Devamsızlık Uyarısı</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:13px;font-family:${font};">Aşağıdaki derslerde sınıra yaklaşıyorsun.</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`;
  }

  if (todayCourses.length > 0) {
    const rows = todayCourses
      .map((c) => {
        const name = escapeHtml(c.course_name);
        const start = escapeHtml(c.start);
        const end = escapeHtml(c.end);
        return `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;color:#111827;font-size:14px;font-family:${font};">${name}</td>
        <td style="padding:10px 0;color:#6b7280;font-size:13px;text-align:right;font-family:${font};">${start} – ${end}</td>
      </tr>`;
      })
      .join("");

    content += `
    <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:20px;border-radius:8px;margin-bottom:20px;">
      <h2 style="margin:0 0 4px;color:#1e40af;font-size:16px;font-family:${font};">Bugünkü Dersler</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:13px;font-family:${font};">${todayDay}, ${dateLabel} — devamsızlık yaşadıysan kaydetmeyi unutma.</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:${font};">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

    <div style="background:#111827;padding:28px 24px;text-align:center;">
      <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;font-family:${font};">Devamsızlık</div>
      <div style="font-size:13px;color:#9ca3af;margin-top:4px;font-family:${font};">Günlük devamsızlık hatırlatması</div>
    </div>

    <div style="padding:28px 24px;">
      ${content}
      <div style="text-align:center;margin-top:28px;">
        <a href="${appUrl}"
           style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:600;font-family:${font};">
          Uygulamayı Aç
        </a>
      </div>
    </div>

    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;font-family:${font};">
        Bu emaili Devamsızlık uygulaması gönderdi.
      </p>
    </div>

  </div>
</body>
</html>`;
}