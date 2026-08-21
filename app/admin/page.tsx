import AdminClient from "./AdminClient";

// Bu sayfa build sırasında statik HTML olarak üretilip CDN'de önbelleklenmesin —
// aksi halde admin panelinin var olduğu, kimse giriş yapmadan bile HTTP 200 +
// prerender edilmiş içerikten anlaşılabiliyordu (bkz. AdminClient içindeki
// "admin panelinin varlığını sızdırma" notu — asıl veri zaten API seviyesinde
// korunuyordu, bu sadece kabuğun statik dağıtılmasını engelliyor). Bu satırın
// etkili olması için server component (üstte "use client" YOK) olarak kalmalı.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminClient />;
}
