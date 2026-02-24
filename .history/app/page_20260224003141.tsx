export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        <h1 className="text-3xl font-semibold text-gray-900 text-center">
          Yoklama
        </h1>

        <p className="mt-3 text-gray-600 text-center">
          Ders programını kaydet, yoklamanı kolayca takip et.
        </p>

        <button className="mt-8 w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-800 transition">
          Dersleri Kur
        </button>

        <button className="mt-3 w-full rounded-xl border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50 transition">
          Dashboard’a Git
        </button>

      </div>
    </main>
  );
}