"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/summary": "Özet",
  "/setup": "Dersler",
  "/weekly": "Haftalık",
  "/admin": "Admin Panel",
};

export default function PresenceBroadcaster() {
  const pathname = usePathname();

  useEffect(() => {
    // Login sayfasında yayın yapma
    if (pathname === "/login" || pathname === "/") return;

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
            email: session.user.email ?? "—",
            page: PAGE_NAMES[pathname] ?? pathname,
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
