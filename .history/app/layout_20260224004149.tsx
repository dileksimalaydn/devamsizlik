import "./globals.css";

export const metadata = {
  title: "Yoklama",
  description: "Basit yoklama web app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* Üst bar */}
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="font-semibold">YOKLAMA</div>

            <nav className="flex gap-3 text-sm">
              <a className="rounded px-2 py-1 hover:bg-gray-100" href="/">
                Home
              </a>
              <a className="rounded px-2 py-1 hover:bg-gray-100" href="/setup">
                Setup
              </a>
              <a className="rounded px-2 py-1 hover:bg-gray-100" href="/dashboard">
                Dashboard
              </a>
            </nav>
          </div>
        </header>

        {/* Sayfa gövdesi */}
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>

        {/* Footer */}
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-gray-500">
            Local dev • Güvenlik: şimdilik sadece local çalışıyoruz
          </div>
        </footer>
      </body>
    </html>
  );
}