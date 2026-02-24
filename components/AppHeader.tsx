"use client";

import Link from "next/link";

export default function AppHeader({
  title = "Okul Yoklama",
  right,
}: {
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white">🎓</div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
        </Link>

        <div className="flex items-center gap-2">{right}</div>
      </div>
    </div>
  );
}