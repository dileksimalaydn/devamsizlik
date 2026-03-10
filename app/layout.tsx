import "./globals.css";
import PresenceBroadcaster from "@/components/PresenceBroadcaster";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

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
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <PresenceBroadcaster />
        <Analytics />
        {children}
      </body>
      <GoogleAnalytics gaId="G-SD3M7D622R" />
      <Script id="ms-clarity" strategy="afterInteractive">{`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "vq75knsh3j");
      `}</Script>
    </html>
  );
}