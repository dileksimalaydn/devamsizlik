"use client";

import Link from "next/link";
import React from "react";
import { GraduationCap } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export default function AppHeader({
  title = "Devamsızlık",
  left,
  right,
}: AppHeaderProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">

        {/* SOL TARAF: Eğer 'left' prop'u varsa onu göster, yoksa varsayılan logoyu göster */}
        <div className="flex items-center gap-2">
          {left ? (
            left
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <GraduationCap size={18} />
              </div>
              <div className="text-sm font-extrabold text-foreground tracking-tight">
                {title}
              </div>
            </Link>
          )}
        </div>

        {/* SAĞ TARAF: Butonlar (Ders Ekle, Çıkış vb.) */}
        <div className="flex items-center gap-2">
          {right}
        </div>
        
      </div>
    </div>
  );
}