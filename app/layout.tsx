import "./globals.css";
import PresenceBroadcaster from "@/components/PresenceBroadcaster";

export const metadata = {
  title: "Yoklama",
  description: "Basit yoklama web app",
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