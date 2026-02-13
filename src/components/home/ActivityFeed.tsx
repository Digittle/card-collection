"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GROUPS, MEMBERS } from "@/lib/groups-data";
import { ALL_CARDS } from "@/lib/cards-data";

const FAKE_NAMES = [
  "あかり", "ゆうき", "さくら", "はると", "みさき",
  "れん", "ひなた", "こころ", "そうた", "あおい",
  "ゆめ", "りく", "ことね", "はるか", "みお",
  "かえで", "しおり", "ゆずき", "まなみ", "りこ",
];

const TIME_LABELS = ["3分前", "8分前", "12分前", "27分前", "1時間前"];

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
  time: string;
}

function generateTanmouActivities(tanmouMemberId: string): Activity[] {
  const member = MEMBERS.find((m) => m.id === tanmouMemberId);
  if (!member) return [];

  const group = GROUPS.find((g) => g.id === member.groupId);
  if (!group) return [];

  const memberCards = ALL_CARDS.filter((c) => c.memberId === tanmouMemberId);

  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60));
  const rand = seededRandom(daySeed);
  const items: Activity[] = [];

  for (let i = 0; i < 5; i++) {
    const name = FAKE_NAMES[Math.floor(rand() * FAKE_NAMES.length)];
    const activityType = Math.floor(rand() * 5);

    let text: string;
    switch (activityType) {
      case 0:
        text = `${name}さんが${member.name}のカードを引きました`;
        break;
      case 1:
        text = `${name}さんが${member.name}を激推しに設定しました`;
        break;
      case 2: {
        const card = memberCards.length > 0
          ? memberCards[Math.floor(rand() * memberCards.length)]
          : null;
        text = card
          ? `${name}さんが${member.name}の${card.title}を入手!`
          : `${name}さんが${member.name}のカードを引きました`;
        break;
      }
      case 3:
        text = `${name}さんが${member.name}のカードにメモを追加しました`;
        break;
      case 4:
        text = `${name}さんが${member.name}のシリーズをコンプリート!`;
        break;
      default:
        text = `${name}さんが${member.name}のカードを引きました`;
    }

    items.push({
      id: `act-${i}`,
      text,
      groupColor: group.accentColor,
      time: TIME_LABELS[i],
    });
  }
  return items;
}

interface ActivityFeedProps {
  tanmouMemberId: string | null;
}

export function ActivityFeed({ tanmouMemberId }: ActivityFeedProps) {
  const activities = useMemo(
    () => (tanmouMemberId ? generateTanmouActivities(tanmouMemberId) : []),
    [tanmouMemberId]
  );

  return (
    <section className="mt-6 px-4 pb-4">
      <h2 className="mb-3 text-[15px] font-bold text-gray-900">
        同担の活動
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        {!tanmouMemberId ? (
          <p className="py-2 text-center text-[13px] text-gray-400">
            担当メンバーを設定すると同担の活動が表示されます
          </p>
        ) : (
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
                <p className="flex-1 text-[13px] text-gray-600">{act.text}</p>
                <span className="shrink-0 text-[11px] text-gray-300">
                  {act.time}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
