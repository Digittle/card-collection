"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GROUPS } from "@/lib/groups-data";
import { ALL_CARDS } from "@/lib/cards-data";

const FAKE_NAMES = [
  "あかり", "ゆうき", "さくら", "はると", "みさき",
  "れん", "ひなた", "こころ", "そうた", "あおい",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface Activity {
  id: string;
  text: string;
  groupColor: string;
}

function generateActivities(): Activity[] {
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60));
  const rand = seededRandom(daySeed);
  const items: Activity[] = [];

  for (let i = 0; i < 5; i++) {
    const name = FAKE_NAMES[Math.floor(rand() * FAKE_NAMES.length)];
    const isComplete = rand() > 0.7;

    if (isComplete) {
      const card = ALL_CARDS[Math.floor(rand() * ALL_CARDS.length)];
      const group = GROUPS.find((g) => g.id === card.groupId)!;
      items.push({
        id: `act-${i}`,
        text: `${name}さんが${card.series}をコンプリート!`,
        groupColor: group.accentColor,
      });
    } else {
      const group = GROUPS[Math.floor(rand() * GROUPS.length)];
      items.push({
        id: `act-${i}`,
        text: `${name}さんが${group.name}のカードを引きました`,
        groupColor: group.accentColor,
      });
    }
  }
  return items;
}

export function ActivityFeed() {
  const activities = useMemo(() => generateActivities(), []);

  return (
    <section className="mt-6 px-4 pb-4">
      <h2 className="mb-3 text-[15px] font-bold text-gray-900">
        みんなの活動
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex flex-col gap-3">
          {activities.map((act, i) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2.5"
            >
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: act.groupColor }}
              />
              <p className="text-[13px] text-gray-600">{act.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
