import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "KVKK Aydınlatma Metni – devamsızlık",
};

export default function KvkkPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni</h1>
          <p className="text-slate-500 text-sm">6698 Sayılı Kişisel Verilerin Korunması Kanunu Uyarınca Hazırlanmıştır</p>
          <p className="text-slate-500 text-sm">Son güncelleme: Mart 2026</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-sm leading-relaxed text-slate-300">
          Bu Aydınlatma Metni; 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır.
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">1. Veri Sorumlusunun Kimliği ve İletişim Bilgileri</h2>
          <div className="space-y-2 text-sm leading-relaxed">
            <p><span className="text-slate-400 font-semibold">Veri Sorumlusu:</span> <span className="text-white">Dilek Şimal Aydın</span></p>
            <p><span className="text-slate-400 font-semibold">Uygulama Adı:</span> <span className="text-white">devamsızlık (devamsizlik.com)</span></p>
            <p><span className="text-slate-400 font-semibold">İletişim E-postası:</span>{" "}
              <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-indigo-400 hover:underline">devamsizlik.iletisim@gmail.com</a>
            </p>
            <p className="text-slate-400 text-xs mt-2">
              KVKK kapsamındaki başvurularınızı yukarıdaki e-posta adresine "KVKK Başvurusu" ibaresiyle iletebilirsiniz. Başvurularınız, kanunun öngördüğü 30 günlük süre içinde yanıtlanacaktır.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">2. İşlenen Kişisel Verilerin Kategorileri</h2>
          <p className="text-sm text-slate-400">Uygulamamız aracılığıyla aşağıdaki kişisel veri kategorileri işlenmektedir:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-slate-300">
                  <th className="text-left px-4 py-3 font-semibold border-b border-slate-800">Veri Kategorisi</th>
                  <th className="text-left px-4 py-3 font-semibold border-b border-slate-800">Verinin İçeriği</th>
                  <th className="text-left px-4 py-3 font-semibold border-b border-slate-800">Nitelik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="bg-slate-950">
                  <td className="px-4 py-3 text-white font-medium">Kimlik Verisi</td>
                  <td className="px-4 py-3 text-slate-400">E-posta adresi</td>
                  <td className="px-4 py-3 text-slate-400">Zorunlu</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="px-4 py-3 text-white font-medium">İşlem Güvenliği Verisi</td>
                  <td className="px-4 py-3 text-slate-400">Giriş tarihi, son oturum bilgisi, şifrelenmiş parola</td>
                  <td className="px-4 py-3 text-slate-400">Zorunlu</td>
                </tr>
                <tr className="bg-slate-950">
                  <td className="px-4 py-3 text-white font-medium">Kullanıcı İçerik Verisi</td>
                  <td className="px-4 py-3 text-slate-400">Ders adları, ders günleri ve saatleri, devamsızlık kayıtları</td>
                  <td className="px-4 py-3 text-slate-400">Kullanıcı tarafından girilir</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            TC kimlik numarası, telefon numarası, adres, kredi kartı bilgisi, sağlık verisi veya özel nitelikli kişisel veri niteliğinde herhangi bir bilgi <strong className="text-white">kesinlikle toplanmamaktadır</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Dayanakları</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">3.1. Sözleşmenin Kurulması ve İfası (KVKK Madde 5/2-c)</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Kullanıcı hesabının oluşturulması, doğrulanması ve yönetilmesi</li>
                <li>Devamsızlık takip hizmetinin eksiksiz olarak sunulması</li>
                <li>Uygulama içi verilerin kullanıcıya özgü saklanması ve görüntülenmesi</li>
                <li>Hesap güvenliğinin sağlanması (şifre sıfırlama, oturum yönetimi)</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">3.2. Meşru Menfaat (KVKK Madde 5/2-f)</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Sistemin güvenliğinin, bütünlüğünün ve sürekliliğinin sağlanması</li>
                <li>Teknik hataların tespiti ve giderilmesi</li>
                <li>Hizmet kalitesinin iyileştirilmesine yönelik anonim istatistik üretilmesi</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">3.3. Açık Rıza (KVKK Madde 5/1)</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Günlük devamsızlık hatırlatma e-postalarının gönderilmesi (e-posta bildirim servisi)</li>
                <li>Devamsızlık sınırına yaklaşıldığında uyarı e-postası iletilmesi</li>
              </ul>
              <p className="text-slate-500 text-xs mt-1">Açık rızaya dayalı işlemler için rızanızı her zaman geri alma hakkınız saklıdır.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">4. Kişisel Verilerin Aktarıldığı Taraflar ve Aktarım Amaçları</h2>
          <p className="text-sm text-slate-400">Kişisel verileriniz; ticari amaçla üçüncü taraflarla paylaşılmamakta, satılmamakta veya kiralanmamaktadır. Yalnızca hizmetin sunulması için zorunlu teknik altyapı sağlayıcılarına, KVKK'nın 8. ve 9. maddeleri kapsamında aktarılmaktadır:</p>
          <div className="space-y-3">
            {[
              {
                name: "Supabase Inc.",
                purpose: "Veritabanı yönetimi ve kimlik doğrulama altyapısı",
                location: "Amerika Birleşik Devletleri / Avrupa Birliği",
                data: "E-posta adresi, şifrelenmiş parola, ders ve devamsızlık verileri",
                basis: "KVKK Madde 9 – Açık rıza ve yeterli koruma",
              },
              {
                name: "Vercel Inc.",
                purpose: "Uygulama barındırma ve dağıtım altyapısı",
                location: "Amerika Birleşik Devletleri / Avrupa Birliği",
                data: "Teknik erişim logları (IP adresi, tarayıcı bilgisi — anonim)",
                basis: "KVKK Madde 9 – Meşru menfaat ve yeterli koruma",
              },
              {
                name: "Resend Inc.",
                purpose: "İşlemsel e-posta gönderim hizmeti",
                location: "Amerika Birleşik Devletleri",
                data: "E-posta adresi, bildirim içeriği",
                basis: "KVKK Madde 9 – Açık rıza",
              },
              {
                name: "Cloudflare Inc.",
                purpose: "Bot koruması ve CAPTCHA doğrulama (Turnstile)",
                location: "Amerika Birleşik Devletleri",
                data: "Tarayıcı parmak izi (anonim, geçici)",
                basis: "KVKK Madde 9 – Meşru menfaat ve yeterli koruma",
              },
            ].map((p) => (
              <div key={p.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm space-y-1">
                <p className="text-white font-semibold">{p.name}</p>
                <p><span className="text-slate-500">Amaç:</span> <span className="text-slate-300">{p.purpose}</span></p>
                <p><span className="text-slate-500">Konum:</span> <span className="text-slate-300">{p.location}</span></p>
                <p><span className="text-slate-500">Aktarılan veri:</span> <span className="text-slate-300">{p.data}</span></p>
                <p><span className="text-slate-500">Hukuki dayanak:</span> <span className="text-slate-300">{p.basis}</span></p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Yukarıda sayılan kuruluşlar; AB Genel Veri Koruma Tüzüğü (GDPR), ABD-AB Veri Gizliliği Çerçevesi (Data Privacy Framework) ve uluslararası güvenlik standartları kapsamında faaliyet göstermektedir. Söz konusu aktarımlar KVKK'nın 9. maddesi uyarınca gerçekleştirilmektedir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">5. Kişisel Verilerin Toplanma Yöntemi</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Kişisel verileriniz; uygulamamızın kayıt ve giriş formları, Google OAuth kimlik doğrulama servisi ve kullanıcının uygulama içinde bizzat girdiği içerikler aracılığıyla <strong className="text-white">elektronik ortamda otomatik yöntemlerle</strong> toplanmaktadır. Verileriniz yalnızca yukarıda belirtilen hukuki dayanaklar çerçevesinde ve bu metinde açıklanan amaçlarla sınırlı olarak işlenmektedir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">6. Kişisel Verilerin Saklanma Süresi</h2>
          <div className="space-y-3 text-sm">
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-slate-300">
                    <th className="text-left px-4 py-3 font-semibold border-b border-slate-800">Veri Türü</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-slate-800">Saklama Süresi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="bg-slate-950">
                    <td className="px-4 py-3 text-white">Hesap ve kimlik doğrulama verileri</td>
                    <td className="px-4 py-3 text-slate-400">Hesap aktif olduğu sürece; hesap silinmesinden itibaren 30 gün</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="px-4 py-3 text-white">Ders ve devamsızlık verileri</td>
                    <td className="px-4 py-3 text-slate-400">Hesap aktif olduğu sürece; silme talebinden itibaren derhal</td>
                  </tr>
                  <tr className="bg-slate-950">
                    <td className="px-4 py-3 text-white">E-posta bildirim logları</td>
                    <td className="px-4 py-3 text-slate-400">90 gün (teknik zorunluluk)</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="px-4 py-3 text-white">Erişim ve işlem logları</td>
                    <td className="px-4 py-3 text-slate-400">Yasal yükümlülük kapsamında azami 2 yıl</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">
              Saklama sürelerinin sona ermesi veya işleme amacının ortadan kalkması halinde kişisel verileriniz silinmekte, yok edilmekte veya anonim hale getirilmektedir.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">7. Veri Sahibi Olarak Haklarınız (KVKK Madde 11)</h2>
          <p className="text-sm text-slate-400">6698 sayılı KVKK'nın 11. maddesi uyarınca kişisel verilerinize ilişkin aşağıdaki haklara sahipsiniz:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { hak: "Bilgi Alma Hakkı", aciklama: "Kişisel verilerinizin işlenip işlenmediğini öğrenme" },
              { hak: "Bilgi Talep Hakkı", aciklama: "İşlenmişse buna ilişkin bilgi talep etme" },
              { hak: "Amaç Sorgulama Hakkı", aciklama: "İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme" },
              { hak: "Aktarım Bilgisi Hakkı", aciklama: "Yurt içinde veya dışında aktarıldığı üçüncü kişileri bilme" },
              { hak: "Düzeltme Hakkı", aciklama: "Eksik veya yanlış işlenen verilerin düzeltilmesini isteme" },
              { hak: "Silme / Yok Etme Hakkı", aciklama: "KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini isteme" },
              { hak: "Bildirim Hakkı", aciklama: "Düzeltme veya silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme" },
              { hak: "İtiraz Hakkı", aciklama: "İşlenen verilerin otomatik sistemler aracılığıyla aleyhinize sonuç doğurmasına itiraz etme" },
              { hak: "Zararın Giderilmesi Hakkı", aciklama: "Kanuna aykırı işleme nedeniyle zarara uğramanız halinde tazminat talep etme" },
            ].map((item) => (
              <div key={item.hak} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm">
                <p className="text-white font-semibold mb-1">{item.hak}</p>
                <p className="text-slate-400 text-xs">{item.aciklama}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">8. Başvuru Yöntemi</h2>
          <div className="bg-slate-900 border border-indigo-900 rounded-xl p-5 text-sm space-y-3">
            <p className="text-slate-300 leading-relaxed">
              KVKK Madde 11 kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemi kullanabilirsiniz:
            </p>
            <div className="space-y-2">
              <p><span className="text-slate-400 font-semibold">E-posta ile başvuru:</span>{" "}
                <a href="mailto:devamsizlik.iletisim@gmail.com" className="text-indigo-400 hover:underline font-medium">devamsizlik.iletisim@gmail.com</a>
              </p>
              <p className="text-slate-500 text-xs">E-posta konusuna <strong className="text-slate-300">"KVKK Veri Sahibi Başvurusu"</strong> yazınız. Başvurunuzda; adınız-soyadınız, e-posta adresiniz, kullandığınız hak ve talebinizin açık ifadesi yer almalıdır.</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Başvurunuz, KVKK'nın 13. maddesi uyarınca talebin niteliğine göre en geç <strong className="text-white">otuz (30) gün</strong> içinde ücretsiz olarak sonuçlandırılacaktır. Talebin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
            </p>
            <p className="text-slate-400 text-xs">
              Başvurunuzun reddedilmesi, verilen cevabın yetersiz bulunması veya süresinde cevap verilmemesi hallerinde; cevabı öğrendiğiniz tarihten itibaren <strong className="text-white">otuz (30)</strong> ve her hâlde başvuru tarihinden itibaren <strong className="text-white">altmış (60)</strong> gün içinde Kişisel Verileri Koruma Kurulu'na şikâyette bulunma hakkınız mevcuttur.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">9. Güvenlik Önlemleri</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Veri sorumlusu olarak kişisel verilerinizin güvenliğini sağlamak amacıyla KVKK'nın 12. maddesi uyarınca teknik ve idari tedbirler alınmaktadır. Bu kapsamda; veriler şifreli iletişim protokolleri (TLS/HTTPS) ile aktarılmakta, kullanıcı parolaları güvenli hash algoritmaları ile saklanmakta, veritabanı erişimi satır düzeyinde güvenlik politikaları (Row Level Security) ile kısıtlanmakta ve yalnızca hizmetin sunulması için zorunlu minimum veriler işlenmektedir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">10. Uygulamanın Bağımsızlığı ve Hizmet Niteliği</h2>
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-5 text-sm space-y-3">
            <p className="text-amber-300 font-semibold">Önemli Açıklama</p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">devamsızlık (devamsizlik.com)</strong>; herhangi bir üniversite, yükseköğretim kurumu, Yükseköğretim Kurulu (YÖK), Millî Eğitim Bakanlığı veya başka bir kamu ya da özel kuruluşla <strong className="text-amber-300">hiçbir organik, hukuki veya ticari bağlantısı bulunmayan bağımsız bir kişisel takip uygulamasıdır</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>Uygulama; resmi yoklama sistemi, devlet kaydı veya herhangi bir kurumun veri tabanıyla entegre değildir ve bu sistemlere erişim sağlamaz.</li>
              <li>Uygulama üzerinden girilen veriler yalnızca kişisel takip amacıyla kullanılmak üzere tasarlanmıştır; resmi kayıt, belge veya hukuki kanıt niteliği taşımaz.</li>
              <li>Uygulamanın sunduğu devamsızlık hesaplamaları (limit, yüzde vb.) <strong className="text-white">tahmini ve bilgilendirici nitelikte</strong> olup bağlı olduğunuz kurumun resmi mevzuatı esas alınmalıdır.</li>
              <li>Kullanıcılar; devamsızlık takibinde uygulamayı tek ve kesin kaynak olarak kullanamaz, bağlı oldukları kurumun resmi kanallarını takip etmekle sorumludur.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">11. Kullanıcı Sorumluluğu</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Kullanıcı, uygulamayı kullanmaya başladığı andan itibaren aşağıdaki hususlarda tam ve münhasır sorumluluğu kabul etmiş sayılır:
          </p>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">11.1. Veri Doğruluğu</p>
              <p className="text-slate-400 leading-relaxed">Uygulamaya girilen tüm veriler (ders adları, saatler, devamsızlık kayıtları vb.) yalnızca kullanıcı tarafından girilmektedir. Bu verilerin doğruluğu, eksiksizliği ve güncelliğinden münhasıran kullanıcı sorumludur. Veri sorumlusu, kullanıcının yanlış veya eksik girdiği bilgilerden doğabilecek herhangi bir sonuçtan sorumlu tutulamaz.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">11.2. Hesap Güvenliği</p>
              <p className="text-slate-400 leading-relaxed">Kullanıcı; hesap şifresinin gizliliğini korumak, güçlü ve benzersiz bir şifre seçmek, oturumunu üçüncü şahıslarla paylaşmamak ve hesabına yetkisiz erişim fark ettiğinde derhal şifresini değiştirmekle yükümlüdür. Kullanıcının şifresini paylaşması, zayıf şifre kullanması veya kendi cihazından kaynaklanan güvenlik açıkları nedeniyle oluşacak zararlardan veri sorumlusu sorumlu değildir.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">11.3. Kullanım Amacı ve Yasal Uyum</p>
              <p className="text-slate-400 leading-relaxed">Kullanıcı, uygulamayı yalnızca kişisel devamsızlık takibi amacıyla, yasalara ve bu Aydınlatma Metni'ne uygun şekilde kullanacağını kabul eder. Uygulamanın kötüye kullanımından, başkalarının verilerine izinsiz erişim girişimlerinden ve üçüncü kişilere zarar verebilecek her türlü eylemden münhasıren kullanıcı sorumludur.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">12. Sorumluluğun Sınırlandırılması</h2>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">12.1. Hizmetin "Olduğu Gibi" Sunulması</p>
              <p className="text-slate-400 leading-relaxed">Uygulama, ticari bir ürün değil bireysel bir geliştirici tarafından sunulan bağımsız bir hizmet olarak <strong className="text-white">"olduğu gibi" (as-is)</strong> sunulmaktadır. Hizmet kesintileri, teknik arızalar, veri kaybı veya sistemdeki hatalardan kaynaklanan doğrudan ya da dolaylı zararlardan veri sorumlusunun sorumluluğu, yürürlükteki mevzuatın izin verdiği azami ölçüde sınırlandırılmıştır.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">12.2. Güvenlik İhlali Riski ve Kabul</p>
              <p className="text-slate-400 leading-relaxed">
                Veri sorumlusu, kişisel verilerin güvenliğini sağlamak için KVKK'nın 12. maddesi kapsamında makul teknik ve idari tedbirler almaktadır. Bununla birlikte, hiçbir teknik sistem %100 güvenlik garantisi sunamamaktadır. Kullanıcı; uygulamaya kaydolarak ve bu Aydınlatma Metni'ni onaylayarak, <strong className="text-white">olası bir güvenlik ihlali durumunda sistemde kayıtlı e-posta adresinin üçüncü kişilerin eline geçebileceği riskini bilerek ve açık rızasıyla</strong> kabul etmektedir.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Güvenlik ihlali tespit edilmesi halinde, veri sorumlusu KVKK'nın 12/5. maddesi uyarınca ilgili kişileri ve Kişisel Verileri Koruma Kurulu'nu en kısa sürede bilgilendirmekle yükümlüdür.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-white font-semibold">12.3. Üçüncü Taraf Altyapısından Kaynaklanan Riskler</p>
              <p className="text-slate-400 leading-relaxed">Uygulama; Supabase, Vercel, Resend ve Cloudflare gibi üçüncü taraf altyapı sağlayıcılarını kullanmaktadır. Bu sağlayıcıların kendi sistemlerinde yaşanabilecek güvenlik açıkları, veri ihlalleri veya hizmet kesintilerinden doğan zararlardan veri sorumlusu sorumlu tutulamaz. Kullanıcı, bu riski bilerek hizmeti kullandığını kabul eder.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">13. Yetkisiz Erişim ve Hukuki Yaptırımlar</h2>
          <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-5 text-sm space-y-4">
            <p className="text-rose-300 font-semibold text-base">Yasal Uyarı</p>
            <p className="text-slate-300 leading-relaxed">
              Uygulamaya kayıtlı kullanıcılara ait hesaplara, kişisel verilere veya sistem bileşenlerine <strong className="text-white">yetkisiz erişim girişimi; Türk Ceza Kanunu ve ilgili mevzuat kapsamında ağır suç teşkil etmekte olup hukuki ve cezai yaptırımlara tabidir.</strong>
            </p>
            <div className="space-y-3">
              <div className="bg-slate-900/60 rounded-xl p-4 space-y-2">
                <p className="text-white font-semibold">5237 Sayılı Türk Ceza Kanunu</p>
                <ul className="space-y-2 text-slate-400">
                  <li><span className="text-rose-400 font-semibold">Madde 243 – Bilişim Sistemine Girme:</span> Bir bilişim sistemine yetkisiz olarak giren kişi <strong className="text-white">1 yıla kadar hapis</strong> cezasıyla cezalandırılır. Sistem içinde kalma veya sistem içindeki verilerin değiştirilmesi halinde ceza artırılır.</li>
                  <li><span className="text-rose-400 font-semibold">Madde 244 – Sistemi Engelleme, Bozma, Verileri Yok Etme:</span> Sistemi kasten işlemez hâle getirme, veri bozma veya silme fiilleri <strong className="text-white">1 ila 5 yıl hapis</strong> cezasını gerektirir.</li>
                  <li><span className="text-rose-400 font-semibold">Madde 135 – Kişisel Verilerin Kaydedilmesi:</span> Hukuka aykırı olarak kişisel verileri kaydeden kişi <strong className="text-white">1 ila 3 yıl hapis</strong> cezasıyla cezalandırılır.</li>
                  <li><span className="text-rose-400 font-semibold">Madde 136 – Verileri Hukuka Aykırı Olarak Ele Geçirme:</span> Kişisel verileri başkasına veren, yayan veya ele geçiren kişi <strong className="text-white">2 ila 4 yıl hapis</strong> cezasıyla cezalandırılır.</li>
                </ul>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 space-y-2">
                <p className="text-white font-semibold">6698 Sayılı KVKK Kapsamında İdari Yaptırımlar</p>
                <p className="text-slate-400">Kişisel verilere hukuka aykırı erişim; KVKK'nın 17. maddesi ve TCK'ya yapılan atıflar çerçevesinde cezai sorumluluk doğurmaktadır. Ek olarak Kişisel Verileri Koruma Kurulu tarafından idari para cezası uygulanabilir.</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Uygulama üzerinde gerçekleştirilen tüm erişim, işlem ve oturum bilgileri teknik altyapı tarafından kayıt altına alınmaktadır. Yetkisiz erişim tespiti hâlinde ilgili log kayıtları yetkili makamlarla paylaşılacak ve suç duyurusunda bulunulacaktır.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">14. Politika Güncellemeleri</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            İşbu Aydınlatma Metni, yasal düzenlemeler veya hizmet kapsamındaki değişiklikler doğrultusunda güncellenebilir. Önemli değişiklikler, kayıtlı e-posta adresinize bildirilir ve güncel metin daima bu sayfada yayımlanır. Uygulamayı kullanmaya devam etmeniz, güncel metni kabul ettiğiniz anlamına gelir.
          </p>
        </section>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-xs text-slate-500 leading-relaxed">
          Bu belge; 6698 sayılı Kişisel Verilerin Korunması Kanunu, Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ ile Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik hükümleri çerçevesinde hazırlanmıştır.
        </div>

        <div className="border-t border-slate-800 pt-6 text-sm">
          <Link href="/" className="text-indigo-400 hover:underline">Ana Sayfaya Dön</Link>
        </div>

      </main>
    </div>
  );
}
