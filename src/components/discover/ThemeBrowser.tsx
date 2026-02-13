"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CARD_THEMES, DEMO_CARDS } from "@/lib/cards-data";
import { getCards } from "@/lib/store";
import { useEffect, useState } from "react";

export function ThemeBrowser() {
  const router = useRouter();
  const [ownedByTheme, setOwnedByTheme] = useState<Record<string, number>>({});

  useEffect(() => {
    const owned = getCards();
    const counts: Record<string, number> = {};
    CARD_THEMES.forEach((t) => {
      counts[t.id] = owned.filter((c) => c.themeId === t.id).length;
    });
    setOwnedByTheme(counts);
  }, []);

  return (
    <section className="mt-6">
      <div className="px-5 pb-3">
        <h3 className="text-[17px] font-bold text-white">テーマで探す</h3>
      </div>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5">
        {CARD_THEMES.map((theme, i) => {
          const totalCards = DEMO_CARDS.filter((c) => c.themeId === theme.id).length;
          const owned = ownedByTheme[theme.id] ?? 0;

          return (
            <motion.button
              key={theme.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => router.push("/shop")}
              className="relative h-[160px] w-[260px] shrink-0 overflow-hidden rounded-2xl border border-white/8 text-left transition-transform active:scale-[0.98]"
            >
              <Image
                src={theme.coverImageUrl}
                alt={theme.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4">
                <div
                  className="mb-2 h-1 w-8 rounded-full"
                  style={{ backgroundColor: theme.accentColor }}
                />
                <h4 className="text-[18px] font-bold text-white">{theme.name}</h4>
                <p className="mt-0.5 text-[12px] text-white/60">{theme.description}</p>
                <p className="mt-1 text-[11px] text-white/40">
                  {owned}/{totalCards} 取得済み
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
