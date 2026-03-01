import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "devamsızlık – Devamsızlık Takip";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#ffffff",
          display: "flex",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dekoratif daireler */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 360, height: 360, borderRadius: "50%", background: "#e0e7ff", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -80, left: 260, width: 200, height: 200, borderRadius: "50%", background: "#fce7f3", display: "flex" }} />
        <div style={{ position: "absolute", top: 80, right: 420, width: 80, height: 80, borderRadius: "50%", background: "#d1fae5", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 60, left: 80, width: 55, height: 55, borderRadius: "50%", background: "#fef3c7", display: "flex" }} />
        <div style={{ position: "absolute", top: 55, left: 490, width: 14, height: 14, borderRadius: "50%", background: "#f97316", display: "flex" }} />
        <div style={{ position: "absolute", top: 115, left: 550, width: 9, height: 9, borderRadius: "50%", background: "#8b5cf6", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 115, right: 185, width: 15, height: 15, borderRadius: "50%", background: "#f43f5e", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 185, right: 455, width: 11, height: 11, borderRadius: "50%", background: "#84cc16", display: "flex" }} />

        {/* Sol taraf */}
        <div style={{ display: "flex", flexDirection: "column", padding: "70px 40px 70px 80px", flex: 1, justifyContent: "center" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
            <div style={{ width: 58, height: 58, borderRadius: "18px", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
              🎓
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#4f46e5" }}>devamsizlik.com</span>
          </div>

          {/* Başlık */}
          <div style={{ fontSize: "78px", fontWeight: 900, color: "#0f172a", lineHeight: 0.95, letterSpacing: "-3px", display: "flex" }}>
            devamsızlık
          </div>

          {/* Alt yazı */}
          <div style={{ marginTop: "20px", fontSize: "24px", color: "#64748b", fontWeight: 500, display: "flex" }}>
            Kaç saatin kaldı? Artık biliyorsun.
          </div>

        </div>

        {/* Sağ taraf */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 80px 60px 0", gap: "18px" }}>
          {/* CE342 - Riskli */}
          <div style={{ background: "white", borderRadius: "28px", padding: "28px 32px", width: "340px", transform: "rotate(3deg)", boxShadow: "0 8px 40px rgba(0,0,0,0.12)", border: "1.5px solid #f1f5f9", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", display: "flex" }}>CE342</div>
                <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: "100px", padding: "3px 12px", fontSize: "13px", fontWeight: 700, display: "flex" }}>Riskli</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", display: "flex" }}>6 / 8 saat</div>
                <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex" }}>2 saat kaldı</div>
              </div>
            </div>
            <div style={{ marginTop: "16px", height: "8px", background: "#f1f5f9", borderRadius: "100px", display: "flex" }}>
              <div style={{ height: "8px", width: "75%", background: "#ef4444", borderRadius: "100px", display: "flex" }} />
            </div>
          </div>

          {/* SE116 - Güvende */}
          <div style={{ background: "white", borderRadius: "28px", padding: "22px 28px", width: "310px", transform: "rotate(-2deg) translateX(18px)", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1.5px solid #f1f5f9", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "flex" }}>SE116</div>
                <div style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "100px", padding: "2px 10px", fontSize: "12px", fontWeight: 700, display: "flex" }}>Güvende</div>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "flex" }}>1 / 8 saat</div>
            </div>
            <div style={{ marginTop: "12px", height: "6px", background: "#f1f5f9", borderRadius: "100px", display: "flex" }}>
              <div style={{ height: "6px", width: "12%", background: "#22c55e", borderRadius: "100px", display: "flex" }} />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
