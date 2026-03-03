import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #312e81 0%, #4f46e5 35%, #7c3aed 65%, #1e1b4b 100%)",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Işık efektleri */}
        <div style={{ position: "absolute", top: -250, right: -250, width: 700, height: 700, borderRadius: "50%", background: "rgba(129,140,248,0.25)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "rgba(167,139,250,0.18)", display: "flex" }} />
        <div style={{ position: "absolute", top: 900, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex" }} />

        {/* ── ÜST BÖLÜM ── */}
        <div style={{ display: "flex", flexDirection: "column", padding: "180px 90px 0", gap: "44px" }}>

          {/* Logo + developed by — aynı satır */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ width: "82px", height: "82px", borderRadius: "24px", background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span style={{ fontSize: "54px", fontWeight: 900, color: "white", letterSpacing: "-2px" }}>
                devamsızlık
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
              <span style={{ color: "rgba(255,255,255,0.62)", fontSize: "20px", fontWeight: 400 }}>developed by</span>
              <span style={{ color: "rgba(255,255,255,0.95)", fontSize: "20px", fontWeight: 700 }}>Dilek Şimal Aydın</span>
            </div>
          </div>

          {/* Hook badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "100px", padding: "12px 28px", width: "700px", marginTop: "16px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#34d399", display: "flex" }} />
            <span style={{ color: "white", fontSize: "21px", fontWeight: 600 }}>
              "Kaç saatim kaldı?" sorusunu bir daha sormayacaksın.
            </span>
          </div>

          {/* Ana başlık */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "8px", lineHeight: 0.93, gap: "0px" }}>
            <span style={{ fontSize: "96px", fontWeight: 900, color: "white", letterSpacing: "-4px", display: "flex" }}>Devamsızlığını</span>
            <span style={{ fontSize: "96px", fontWeight: 900, color: "white", letterSpacing: "-4px", display: "flex" }}>kontrol altına</span>
            <span style={{ fontSize: "96px", fontWeight: 900, color: "#c7d2fe", letterSpacing: "-4px", display: "flex" }}>al</span>
          </div>

          {/* Alt yazı */}
          <span style={{ fontSize: "28px", color: "#e0e7ff", fontWeight: 600, display: "flex", marginTop: "4px" }}>
            Sen derslerine odaklan, sınırları biz tutalım.
          </span>
        </div>

        {/* ── KARTLAR — siyah kutu yok, direkt gradient üzerinde ── */}
        <div style={{ display: "flex", flexDirection: "column", padding: "52px 80px 0", gap: "16px" }}>

          {/* BA350 — Teorik — Riskli */}
          <div style={{ background: "white", borderRadius: "24px", padding: "26px 30px 30px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a" }}>BA350</span>
                  <span style={{ background: "#eef2ff", color: "#1e1b4b", borderRadius: "100px", padding: "3px 12px", fontSize: "14px", fontWeight: 800, display: "flex" }}>TEORİK</span>
                </div>
                <span style={{ background: "#fef2f2", color: "#dc2626", borderRadius: "100px", padding: "4px 15px", fontSize: "16px", fontWeight: 700, display: "flex", width: "72px" }}>Riskli</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a" }}>10 / 12 saat</span>
                <span style={{ fontSize: "15px", color: "#94a3b8" }}>2 saat kaldı</span>
              </div>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: "100px", height: "10px", display: "flex" }}>
              <div style={{ width: "83%", background: "#ef4444", borderRadius: "100px", height: "10px", display: "flex" }} />
            </div>
          </div>

          {/* ENG399 — Teorik — Dikkat */}
          <div style={{ background: "white", borderRadius: "24px", padding: "26px 30px 30px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.24)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a" }}>ENG399</span>
                  <span style={{ background: "#eef2ff", color: "#1e1b4b", borderRadius: "100px", padding: "3px 12px", fontSize: "14px", fontWeight: 800, display: "flex" }}>TEORİK</span>
                </div>
                <span style={{ background: "#fffbeb", color: "#92400e", borderRadius: "100px", padding: "4px 15px", fontSize: "16px", fontWeight: 700, display: "flex", width: "68px" }}>Dikkat</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a" }}>7 / 12 saat</span>
                <span style={{ fontSize: "15px", color: "#94a3b8" }}>5 saat kaldı</span>
              </div>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: "100px", height: "10px", display: "flex" }}>
              <div style={{ width: "58%", background: "#f59e0b", borderRadius: "100px", height: "10px", display: "flex" }} />
            </div>
          </div>

          {/* SE116 — Lab — Güvende */}
          <div style={{ background: "white", borderRadius: "24px", padding: "26px 30px 30px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a" }}>SE116</span>
                  <span style={{ background: "#f5f3ff", color: "#2e1065", borderRadius: "100px", padding: "3px 12px", fontSize: "14px", fontWeight: 800, display: "flex" }}>LAB</span>
                </div>
                <span style={{ background: "#f0fdf4", color: "#15803d", borderRadius: "100px", padding: "4px 15px", fontSize: "16px", fontWeight: 700, display: "flex", width: "80px" }}>Güvende</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a" }}>1 / 6 saat</span>
                <span style={{ fontSize: "15px", color: "#94a3b8" }}>5 saat kaldı</span>
              </div>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: "100px", height: "10px", display: "flex" }}>
              <div style={{ width: "17%", background: "#22c55e", borderRadius: "100px", height: "10px", display: "flex" }} />
            </div>
          </div>
        </div>

        {/* ── ALT BÖLÜM — kartlara yakın ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 90px 40px", gap: "20px" }}>

          {/* Ücretsiz badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "100px", padding: "11px 28px" }}>
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#34d399", display: "flex" }} />
            <span style={{ color: "#6ee7b7", fontSize: "21px", fontWeight: 700 }}>Tamamen Ücretsiz</span>
          </div>

          {/* URL */}
          <div style={{ background: "white", borderRadius: "28px", padding: "26px 70px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span style={{ fontSize: "38px", fontWeight: 900, color: "#4f46e5", letterSpacing: "-1.5px" }}>
              devamsizlik.com
            </span>
          </div>

        </div>

        {/* Yasal uyarı */}
        <div style={{ padding: "0 90px 80px", display: "flex" }}>
          <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.28)", fontWeight: 400, lineHeight: 1.6 }}>
            Bu uygulama bağımsız bir takip aracıdır. Herhangi bir üniversite veya kurum ile resmi bağlantısı yoktur. Gösterilen veriler kullanıcı tarafından girilir, resmi devamsızlık kayıtlarını temsil etmez.
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
