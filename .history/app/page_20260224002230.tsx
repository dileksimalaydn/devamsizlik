export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>İlk Web Tasarımım</h1>
      <p style={{ fontSize: 18, opacity: 0.8 }}>
        Next.js çalışıyor ✅ Şimdi tasarıma başlıyoruz.
      </p>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Kart</h2>
        <p style={{ marginTop: 8 }}>
          Bu bir “section/card” örneği. Birazdan Tailwind ile güzelleştireceğiz.
        </p>
        <button style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #000" }}>
          Buton
        </button>
      </div>
    </main>
  );
}