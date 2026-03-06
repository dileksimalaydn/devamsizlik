"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { GraduationCap, Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600 shadow-lg shadow-indigo-900/30">
        <GraduationCap size={32} className="text-white" />
      </div>
      <Loader2 size={24} className="animate-spin text-slate-400" />
    </div>
  );
}
