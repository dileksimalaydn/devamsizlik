import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası – devamsızlık",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-extrabold text-white mb-2">Gizlilik Politikası</h1>
          <p className="text-slate-500 text-sm">Son güncelleme: Mart 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Veri Sorumlusu</h2>
          <p>
            Bu gizlilik politikası, <strong className="text-white">devamsizlik.com</strong> adresinde
            hizmet veren devamsızlık takip uygulamasına aittir. Veri sorumlusu:{" "}
            <strong className="text-white">devamsızlık platformu</strong>.
          </p>
          <p>
            İletişim:{" "}
            <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-indigo-400 hover:underline">
              devamsizlik.iletisim@gmail.com
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Toplanan Kişisel Veriler</h2>
          <p>Uygulamamız yalnızca aşağıdaki verileri toplar:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-white">E-posta adresi:</strong> Hesap oluşturma ve bildirim göndermek için.</li>
            <li><strong className="text-white">Ders bilgileri:</strong> Ders adı, gün, saat ve devamsızlık kayıtları. Bu veriler tamamen kullanıcı tarafından girilir.</li>
          </ul>
          <p>
            Kredi kartı, TC kimlik numarası, telefon numarası veya konum bilgisi <strong className="text-white">toplanmamaktadır</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Verilerin İşlenme Amacı</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kullanıcı hesabının oluşturulması ve yönetilmesi</li>
            <li>Devamsızlık takip hizmetinin sunulması</li>
            <li>Günlük devamsızlık hatırlatma e-postalarının gönderilmesi</li>
          </ul>
          <p>
            Verileriniz üçüncü taraflarla pazarlama amacıyla paylaşılmaz, satılmaz.
          </p>
          <p className="text-sm text-slate-500 border-l-2 border-slate-700 pl-3">
            E-posta bildirimleri yardımcı hatırlatma niteliğindedir. Teknik aksaklıklar, spam filtreleri veya servis kesintileri nedeniyle kullanıcıya ulaşmayabilir. Nihai takip sorumluluğu kullanıcıya aittir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Hukuki Dayanak</h2>
          <p>
            Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında,{" "}
            <strong className="text-white">açık rızanız</strong> ve{" "}
            <strong className="text-white">sözleşmenin ifası</strong> hukuki dayanakları ile işlenmektedir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Üçüncü Taraf Hizmet Sağlayıcılar</h2>
          <p>Verileriniz yalnızca hizmetin sunulması amacıyla aşağıdaki güvenilir altyapı sağlayıcılarına aktarılır:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-white">Supabase:</strong> Veritabanı ve kimlik doğrulama altyapısı (ABD/AB)</li>
            <li><strong className="text-white">Resend:</strong> E-posta gönderim hizmeti (ABD)</li>
            <li><strong className="text-white">Vercel:</strong> Uygulama hosting (ABD/AB)</li>
          </ul>
          <p>Bu sağlayıcılar uluslararası veri güvenliği standartlarına uymaktadır.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Veri Saklama Süresi</h2>
          <p>
            Verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızı sildiğinizde veriler
            sistemden kaldırılır. Yedekleme sistemleri nedeniyle kalıcı silme işlemi belirli bir süre
            alabilir; silme talebi halinde işlenme amacı ortadan kalktığında veriler makul süre içinde silinir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">7. Haklarınız (KVKK Madde 11)</h2>
          <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>Verilerin düzeltilmesini isteme</li>
            <li>Verilerin silinmesini veya yok edilmesini isteme</li>
            <li>İşlemenin kısıtlanmasını talep etme</li>
            <li>Veri taşınabilirliği talep etme</li>
          </ul>
          <p>
            Bu haklarınızı kullanmak için{" "}
            <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-indigo-400 hover:underline">
              devamsizlik.iletisim@gmail.com
            </a>{" "}
            adresine e-posta gönderebilirsiniz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">8. Değişiklikler</h2>
          <p>
            Bu politika gerektiğinde güncellenebilir. Önemli değişiklikler kayıtlı e-posta adresinize
            bildirilir.
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
