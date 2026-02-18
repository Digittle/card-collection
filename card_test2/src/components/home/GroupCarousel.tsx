"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GROUPS } from "@/lib/groups-data";
import { getCardsByGroup } from "@/lib/cards-data";
import { getCards } from "@/lib/store";

export function GroupCarousel() {
  const router = useRouter();
  const ownedCards = getCards();

  return (
    <section className="mt-6">
      <h2 className="mb-3 px-4 text-[15px] font-bold text-gray-900">グループ</h2>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {GROUPS.map((group, i) => {
          const totalGroupCards = getCardsByGroup(group.id).length;
          const ownedCount = ownedCards.filter(
            (c) => c.groupId === group.id
          ).length;

          return (
            <motion.button
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => router.push(`/collection?group=${group.id}`)}
              className="flex-none snap-start rounded-xl p-4"
              style={{
                width: 160,
                height: 100,
                background: `linear-gradient(135deg, ${group.accentColor}66 0%, ${group.accentColor}22 100%)`,
              }}
            >
              <div className="flex h-full flex-col items-start justify-between text-left">
                <div>
                  <p className="text-[15px] font-bold text-white">
                    {group.name}
                  </p>
                  <p className="text-[11px] text-white/50">{group.debutYear}</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    backgroundColor: group.accentColor + "33",
                    color: group.accentColor,
                  }}
                >
                  {ownedCount}/{totalGroupCards}枚
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
