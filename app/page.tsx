"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { GraduationCap, Bell, CalendarCheck, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const { isAdmin } = await res.json();
      router.replace(isAdmin ? "/admin" : "/dashboard");
    })();
  }, [router]);

  return (
    <div className="min-h-screen text-slate-900">

      {/* Fixed arka plan — canlı indigo → violet gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 35%, #7c3aed 65%, #1e1b4b 100%)",
        }}
      />
      {/* Işık efekti */}
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, #818cf8 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #a78bfa 0%, transparent 50%)",
        }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/20">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-white tracking-tight text-lg">devamsızlık</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shrink-0" />
            <span className="text-white/60 text-[11px] font-medium">developed by</span>
            <span className="text-white text-[11px] font-bold">Dilek Şimal Aydın</span>
          </span>
          <Link
            href="/login"
            className="rounded-2xl bg-white px-5 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/30"
          >
            Giriş Yap
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
        {/* Hook badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-2 text-sm font-semibold text-white mb-8 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          "Kaç saatim kaldı?" sorusunu bir daha sormayacaksın.
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Üniversite zamanını<br />
          <span className="text-indigo-200">devamsızlık hesaplayarak</span><br />
          harcama.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto leading-relaxed">
          Derslerini bir kez ekle. Limitini öğren. Sınıra yaklaştığında seni uyaralım —
          sen dersin tadını çıkar.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-indigo-700 hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-900/40 active:scale-95"
          >
            Ücretsiz Başla
          </Link>
        </div>
        <p className="mt-4 text-xs text-indigo-300/60 text-center">
          Herhangi bir üniversite ile resmi bağlantısı bulunmayan bağımsız bir takip uygulamasıdır.
        </p>

      </section>

      {/* Mockup */}
      <section className="mx-auto max-w-sm px-6 pb-4">
        <div className="relative mx-auto w-64 drop-shadow-2xl">
          <div className="rounded-[2.5rem] border-2 border-white/20 bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-700" />

            <div className="rounded-2xl bg-white p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900">SE116</div>
                  <div className="text-[9px] font-bold text-rose-600 bg-rose-50 rounded-full px-1.5 py-0.5 inline-block mt-0.5">Riskli</div>
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

            <div className="rounded-2xl bg-white p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900">MAT201</div>
                  <div className="text-[9px] font-bold text-amber-700 bg-amber-50 rounded-full px-1.5 py-0.5 inline-block mt-0.5">Dikkat</div>
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

            <div className="rounded-2xl bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900">FİZ101</div>
                  <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-1.5 py-0.5 inline-block mt-0.5">Güvende</div>
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

            <div className="mt-3 mx-auto h-1 w-20 rounded-full bg-slate-700" />
          </div>
        </div>
      </section>

      {/* Beyaz bölge — yukarı çıkar */}
      <section className="relative mt-12 bg-white rounded-t-[3rem] shadow-2xl">
        {/* Özellikler */}
        <div className="mx-auto max-w-4xl px-6 pt-14 pb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-2">Nasıl Çalışır?</h2>
          <p className="text-center text-slate-400 text-sm mb-10">3 adımda devamsızlığını kontrol altına al.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <CalendarCheck size={20} className="text-indigo-600" />,
                step: "1",
                title: "Derslerini Ekle",
                desc: "Ders adı, gün ve saatini bir kez gir. Limitin otomatik hesaplanır — ya da kendin belirlersin.",
              },
              {
                icon: <BarChart3 size={20} className="text-indigo-600" />,
                step: "2",
                title: "Devamsızlığı İşle",
                desc: "Tek dokunuşla kaydet. Geçmişe de ekleyebilirsin — kaçırdığın günleri sonradan gir.",
              },
              {
                icon: <Bell size={20} className="text-indigo-600" />,
                step: "3",
                title: "Sınırı Takip Et",
                desc: "Kaç saatin kaldığını anlık gör. Sınıra yaklaştığında otomatik uyarı al.",
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="rounded-3xl bg-slate-50 border border-slate-100 p-6 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-100">
                    {icon}
                  </div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Adım {step}</span>
                </div>
                <div className="font-bold text-slate-900 mb-1">{title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-10 shadow-xl shadow-indigo-200">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Hep merak ettin, değil mi?
            </h2>
            <p className="text-indigo-200 mb-8 text-sm leading-relaxed">
              Binlerce öğrenci her gün "acaba kaç saatim kaldı?" diye merak eder.<br />
              Sen merak etme — biz hesaplayalım.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-2xl bg-white px-8 py-4 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Hemen Ücretsiz Başla
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 py-6 text-center space-y-1.5">
          <p className="text-xs text-slate-400">Developed by Dilek Şimal Aydın · devamsizlik.com</p>
          <p className="text-[10px] text-slate-300 max-w-sm mx-auto leading-relaxed">
            Bu uygulama bağımsız bir takip aracıdır. Herhangi bir üniversite veya kurum ile resmi bağlantısı yoktur. Gösterilen veriler kullanıcı tarafından girilir, resmi devamsızlık kayıtlarını temsil etmez.
          </p>
          <div className="flex items-center justify-center gap-4 pt-1">
            <Link href="/privacy" className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
              Gizlilik Politikası
            </Link>
            <span className="text-slate-300 text-[10px]">·</span>
            <Link href="/terms" className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
              Kullanım Şartları
            </Link>
          </div>
        </footer>
      </section>
    </div>
  );
}
