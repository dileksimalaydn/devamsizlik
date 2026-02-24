"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function itemClass(active: boolean) {
  return active
    ? "flex flex-col items-center gap-1 text-slate-900 font-semibold"
    : "flex flex-col items-center gap-1 text-slate-500";
}

export default function BottomNav() {
  const path = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-md grid-cols-3 px-6 py-3 text-xs">
        <Link href="/dashboard" className={itemClass(path === "/dashboard")}>
          <div className="text-lg">🏠</div>
          Bugün
        </Link>

        <Link href="/summary" className={itemClass(path === "/summary")}>
          <div className="text-lg">📊</div>
          Devamsızlıklar
        </Link>

        <Link href="/setup" className={itemClass(path === "/setup")}>
          <div className="text-lg">📚</div>
          Dersler
        </Link>
      </div>
    </div>
  );
}