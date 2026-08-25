/** Admin API route'larının ortak yardımcıları — üç route'ta ayrı ayrı kopyalanmasın diye tek yerde. */

export function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const admins = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

/**
 * Rate limit için istemci IP'sini çıkarır. Vercel, istemcinin kendi
 * gönderdiği X-Forwarded-For değerinin SONUNA kendi tespit ettiği gerçek
 * bağlantı IP'sini ekler — yani listenin ilk değeri istemci tarafından
 * uydurulabilir, güvenilir olan tek değer listenin SON elemanıdır.
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
