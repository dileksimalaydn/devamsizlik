import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası – devamsızlık",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-muted-foreground">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-card/80 border-b border-border">
        <div className="flex items-center gap-3 px-6 py-4 max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary">
              <GraduationCap size={16} className="text-foreground" />
            </div>
            <span className="font-extrabold text-foreground tracking-tight">devamsızlık</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Gizlilik Politikası</h1>
          <p className="text-muted-foreground text-sm">Son güncelleme: Mart 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">1. Veri Sorumlusu</h2>
          <p>
            Bu gizlilik politikası, <strong className="text-foreground">devamsizlik.com</strong> adresinde
            hizmet veren devamsızlık takip uygulamasına aittir. Veri sorumlusu:{" "}
            <strong className="text-foreground">devamsızlık platformu</strong>.
          </p>
          <p>
            İletişim:{" "}
            <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-primary hover:underline">
              devamsizlik.iletisim@gmail.com
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">2. Toplanan Kişisel Veriler</h2>
          <p>Uygulamamız yalnızca aşağıdaki verileri toplar:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">E-posta adresi:</strong> Hesap oluşturma ve bildirim göndermek için.</li>
            <li><strong className="text-foreground">Okuduğu okul:</strong> Kullanıcının seçtiği üniversite adı. Ders süresi hesaplamasında kullanılır.</li>
            <li><strong className="text-foreground">Ders bilgileri:</strong> Ders adı, gün, saat ve devamsızlık kayıtları. Bu veriler tamamen kullanıcı tarafından girilir.</li>
          </ul>
          <p>
            Kredi kartı, TC kimlik numarası, telefon numarası veya konum bilgisi <strong className="text-foreground">toplanmamaktadır</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">3. Verilerin İşlenme Amacı</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kullanıcı hesabının oluşturulması ve yönetilmesi</li>
            <li>Devamsızlık takip hizmetinin sunulması</li>
            <li>Günlük devamsızlık hatırlatma e-postalarının gönderilmesi</li>
          </ul>
          <p>
            Verileriniz üçüncü taraflarla pazarlama amacıyla paylaşılmaz, satılmaz.
          </p>
          <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">
            E-posta bildirimleri yardımcı hatırlatma niteliğindedir. Teknik aksaklıklar, spam filtreleri veya servis kesintileri nedeniyle kullanıcıya ulaşmayabilir. Nihai takip sorumluluğu kullanıcıya aittir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">4. Hukuki Dayanak</h2>
          <p>
            Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında,{" "}
            <strong className="text-foreground">açık rızanız</strong> ve{" "}
            <strong className="text-foreground">sözleşmenin ifası</strong> hukuki dayanakları ile işlenmektedir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">5. Üçüncü Taraf Hizmet Sağlayıcılar</h2>
          <p>Verileriniz yalnızca hizmetin sunulması amacıyla aşağıdaki güvenilir altyapı sağlayıcılarına aktarılır:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Supabase:</strong> Veritabanı ve kimlik doğrulama altyapısı (ABD/AB)</li>
            <li><strong className="text-foreground">Resend:</strong> E-posta gönderim hizmeti (ABD)</li>
            <li><strong className="text-foreground">Vercel:</strong> Uygulama hosting ve anonim sayfa analizi (ABD/AB)</li>
            <li><strong className="text-foreground">Google Analytics:</strong> Anonim kullanım istatistikleri (ABD/AB)</li>
            <li><strong className="text-foreground">Microsoft Clarity:</strong> Anonim kullanıcı deneyimi analizi; tıklama ve gezinme davranışı kaydı. Şifreler ve kişisel form alanları otomatik maskelenir (ABD/AB)</li>
            <li><strong className="text-foreground">Cloudflare Turnstile:</strong> Bot koruması ve CAPTCHA doğrulama (ABD)</li>
          </ul>
          <p>Bu sağlayıcılar uluslararası veri güvenliği standartlarına uymaktadır.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">6. Veri Saklama Süresi</h2>
          <p>
            Verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızı sildiğinizde veriler
            sistemden kaldırılır. Yedekleme sistemleri nedeniyle kalıcı silme işlemi belirli bir süre
            alabilir; silme talebi halinde işlenme amacı ortadan kalktığında veriler makul süre içinde silinir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">7. Haklarınız (KVKK Madde 11)</h2>
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
            <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-primary hover:underline">
              devamsizlik.iletisim@gmail.com
            </a>{" "}
            adresine e-posta gönderebilirsiniz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">8. Değişiklikler</h2>
          <p>
            Bu politika gerektiğinde güncellenebilir. Önemli değişiklikler kayıtlı e-posta adresinize
            bildirilir.
          </p>
        </section>

        <div className="border-t border-border pt-6 text-center">
          <Link href="/" className="text-primary hover:underline text-sm">
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </div>
  );
}
