import "./globals.css";
import PresenceBroadcaster from "@/components/PresenceBroadcaster";

export const metadata = {
  title: "devamsızlık – Devamsızlık Takip",
  description: "Ders devamsızlıklarını takip et, sınıra ne kadar yaklaştığını gör. Ücretsiz, hızlı, mobil uyumlu.",
  metadataBase: new URL("https://devamsizlik.com"),
  openGraph: {
    title: "devamsızlık – Devamsızlık Takip",
    description: "Ders devamsızlıklarını takip et, sınıra ne kadar yaklaştığını gör. Ücretsiz, hızlı, mobil uyumlu.",
    url: "https://devamsizlik.com",
    siteName: "devamsızlık",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "https://devamsizlik.com/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary",
    title: "devamsızlık – Devamsızlık Takip",
    description: "Ders devamsızlıklarını takip et, sınıra ne kadar yaklaştığını gör.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <PresenceBroadcaster />
        {children}
      </body>
    </html>
  );
}