"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return; // landing page'i göster
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const { isAdmin } = await res.json();
      router.replace(isAdmin ? "/admin" : "/dashboard");
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight">devamsızlık</span>
        </div>
        <Link
          href="/login"
          className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
        >
          Giriş Yap
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20 text-center">
        <div className="inline-block rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-6">
          Ücretsiz · Kayıt gerektirmez
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Üniversite hayatını<br />
          <span className="text-indigo-600">devamsızlık hesaplayarak</span><br />
          harcama.
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Derslerini bir kez ekle. Devamsızlık hakkın otomatik hesaplansın. Sınıra yaklaştığında seni uyaralım.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Hemen Ücretsiz Başla
          </Link>
        </div>
      </section>

      {/* Mockup */}
      <section className="mx-auto max-w-sm px-6 pb-20">
        <div className="relative mx-auto w-64">
          {/* Telefon çerçevesi */}
          <div className="rounded-[2.5rem] border-4 border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-300">
            {/* Kamera */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-700" />
            {/* Sahte kart 1 */}
            <div className="rounded-2xl bg-white p-3 mb-2 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900">SE116</div>
                  <div className="text-[9px] font-semibold text-rose-600 bg-rose-50 rounded-full px-1.5 py-0.5 inline-block mt-0.5">Riskli</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-900">6 / 8 saat</div>
                  <div className="text-[9px] text-slate-400">2 saat kaldı</div>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-1.5 rounded-full bg-rose-500" style={{ width: "75%" }} />
              </div>
            </div>
            {/* Sahte kart 2 */}
            <div className="rounded-2xl bg-white p-3 mb-2 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900">MAT201</div>
                  <div className="text-[9px] font-semibold text-amber-700 bg-amber-50 rounded-full px-1.5 py-0.5 inline-block mt-0.5">Dikkat</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-900">4 / 8 saat</div>
                  <div className="text-[9px] text-slate-400">4 saat kaldı</div>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-1.5 rounded-full bg-amber-400" style={{ width: "50%" }} />
              </div>
            </div>
            {/* Sahte kart 3 */}
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900">FİZ101</div>
                  <div className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-1.5 py-0.5 inline-block mt-0.5">Güvende</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-900">1 / 8 saat</div>
                  <div className="text-[9px] text-slate-400">7 saat kaldı</div>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: "12%" }} />
              </div>
            </div>
            {/* Alt çubuk */}
            <div className="mt-3 mx-auto h-1 w-20 rounded-full bg-slate-700" />
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-extrabold text-center text-slate-900 mb-10">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Derslerini Ekle", desc: "Ders adı, gün ve saatini bir kez gir. Blok sayısına göre limit otomatik hesaplanır." },
              { step: "2", title: "Devamsızlığı İşle", desc: "Derse girmedin mi? Tek dokunuşla kaydet. Geçmişe de ekleyebilirsin." },
              { step: "3", title: "Sınırı Takip Et", desc: "Teorik %30, Lab %20 kuralına göre ne kadar hakkın kaldığını anlık gör." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white font-extrabold text-sm mb-4">
                  {step}
                </div>
                <div className="font-bold text-slate-900 mb-1">{title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center px-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Hep merak ettin, değil mi?</h2>
        <p className="text-slate-500 mb-6 text-sm">"Kaç saatim kaldı?" sorusunu bir daha sormayacaksın.</p>
        <Link
          href="/login"
          className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Ücretsiz Başla
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        Öğrenciler tarafından, öğrenciler için yapıldı. · devamsızlık.com
      </footer>
    </div>
  );
}
