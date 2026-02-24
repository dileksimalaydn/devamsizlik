export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          Dashboard
        </h1>

        <p className="mt-3 text-gray-600 text-center">
          Burada kaydettiğin dersleri göstereceğiz.
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
          Henüz ders yok.
        </div>

      </div>
    </main>
  );
}