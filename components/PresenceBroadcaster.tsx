"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/summary": "Özet",
  "/setup": "Dersler",
  "/weekly": "Haftalık",
};

// Yayın yapılacak izin verilen sayfalar — başka hiçbir path broadcast etmez
const ALLOWED_PATHS = new Set(Object.keys(PAGE_NAMES));

export default function PresenceBroadcaster() {
  const pathname = usePathname();

  useEffect(() => {
    // Sadece izin verilen 4 sayfada yayın yap
    if (!ALLOWED_PATHS.has(pathname)) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;

      channel = supabase.channel("app-presence", {
        config: { presence: { key: session.user.id } },
      });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel!.track({
            user_id: session.user.id,
            // Email yok — başka kullanıcılar presence kanalını okuyabilir
            page: PAGE_NAMES[pathname],
            online_at: new Date().toISOString(),
          });
        }
      });
    });

    return () => {
      channel?.unsubscribe();
    };
  }, [pathname]);

  return null;
}
