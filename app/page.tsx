"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/dashboard");
      else router.replace("/login");
    })();
  }, [router]);

  return <div style={{ padding: 20 }}>Yönlendiriliyor...</div>;
}