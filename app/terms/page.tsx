import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Kullanım Şartları – devamsızlık",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-3 px-6 py-4 max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-white tracking-tight">devamsızlık</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Kullanım Şartları</h1>
          <p className="text-slate-500 text-sm">Son güncelleme: Mart 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Hizmet Hakkında</h2>
          <p>
            devamsızlık (<strong className="text-white">devamsizlik.com</strong>), üniversite
            öğrencilerinin derse devamsızlıklarını takip etmelerine yardımcı olan ücretsiz bir web
            uygulamasıdır. Uygulama, <strong className="text-white">Dilek Şimal Aydın</strong>{" "}
            tarafından geliştirilmiş bağımsız bir projedir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Sorumluluk Reddi</h2>
          <p>
            Bu uygulama herhangi bir üniversite veya resmi kurum ile{" "}
            <strong className="text-white">bağlantılı değildir</strong>. Gösterilen devamsızlık
            verileri tamamen kullanıcı tarafından girilir ve{" "}
            <strong className="text-white">resmi kayıtları temsil etmez</strong>.
          </p>
          <p>
            Uygulamada görüntülenen veriler yalnızca kullanıcının kendi girişine dayalıdır. Uygulama
            geliştirici, yanlış veya eksik veri girişinden kaynaklanan sonuçlardan sorumlu tutulamaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Kullanım Koşulları</h2>
          <p>Uygulamayı kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Uygulamayı yalnızca kişisel, eğitim amaçlı kullanacaksınız.</li>
            <li>Başkalarının hesaplarına yetkisiz erişim sağlamaya çalışmayacaksınız.</li>
            <li>Uygulamaya zarar verici, kötü amaçlı içerik yüklemeyeceksiniz.</li>
            <li>Sistemi aşırı yükleyecek otomatik istekler göndermeyeceksiniz.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Hizmet Sürekliliği</h2>
          <p>
            Uygulama ücretsiz olarak sunulmaktadır. Geliştirici, önceden bildirim yapmaksızın hizmeti
            geçici veya kalıcı olarak durdurma hakkını saklı tutar. Bu durumda kullanıcılar
            makul ölçüde önceden bilgilendirilmeye çalışılır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Fikri Mülkiyet</h2>
          <p>
            Uygulamanın tasarımı, kodu ve içeriği Dilek Şimal Aydın&apos;a aittir. İzinsiz kopyalanamaz,
            dağıtılamaz veya ticari amaçla kullanılamaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Hesap Silme</h2>
          <p>
            Hesabınızı ve tüm verilerinizi silmek için{" "}
            <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-indigo-400 hover:underline">
              devamsizlik.iletisim@gmail.com
            </a>{" "}
            adresine e-posta gönderebilirsiniz. Talebiniz, işlenme amacının ortadan kalkmasıyla makul süre içinde yerine getirilir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">7. Uygulanacak Hukuk</h2>
          <p>
            Bu kullanım şartları Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Türk
            mahkemeleri yetkilidir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">8. İletişim</h2>
          <p>
            Sorularınız için:{" "}
            <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-indigo-400 hover:underline">
              devamsizlik.iletisim@gmail.com
            </a>
          </p>
        </section>

        <div className="border-t border-slate-800 pt-6 text-center">
          <Link href="/" className="text-indigo-400 hover:underline text-sm">
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </div>
  );
}
