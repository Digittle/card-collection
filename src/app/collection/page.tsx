"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Gift } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { CardTile } from "@/components/card/CardTile";
import { ALL_CARDS, getCardsByGroup } from "@/lib/cards-data";
import { getUser, getCards } from "@/lib/store";
import { GROUPS } from "@/lib/groups-data";

type ViewMode = "owned" | "zukan";

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F5F6]" />}>
      <CollectionInner />
    </Suspense>
  );
}

function CollectionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("zukan");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    const groupParam = searchParams.get("group");
    if (groupParam && GROUPS.some((g) => g.id === groupParam)) {
      setSelectedGroup(groupParam);
    }
    setMounted(true);
  }, [router, searchParams]);

  const ownedCards = useMemo(() => {
    if (!mounted) return [];
    return getCards();
  }, [mounted]);

  const ownedIds = useMemo(
    () => new Set(ownedCards.map((c) => c.id)),
    [ownedCards]
  );

  const filteredCards = useMemo(() => {
    const base =
      selectedGroup === "all"
        ? ALL_CARDS
        : getCardsByGroup(selectedGroup);

    if (viewMode === "owned") {
      return base.filter((c) => ownedIds.has(c.id));
    }
    return base;
  }, [selectedGroup, viewMode, ownedIds]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  const ownedCount = ownedCards.length;

  return (
    <AppShell>
      <Header title="コレクション" />

      <div className="px-4 pb-8">
        {/* Stats */}
        <div className="mt-4 text-center">
          <span className="text-[13px] text-gray-500">
            所持: <span className="font-bold text-gray-900">{ownedCount}</span> / {ALL_CARDS.length}枚
          </span>
        </div>

        {/* Group filter pills */}
        <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedGroup("all")}
            className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors"
            style={
              selectedGroup === "all"
                ? { backgroundColor: "#ec6d81", color: "#fff" }
                : { backgroundColor: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.4)" }
            }
          >
            すべて
          </button>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors"
              style={
                selectedGroup === group.id
                  ? { backgroundColor: group.accentColor, color: "#fff" }
                  : { backgroundColor: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.4)" }
              }
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="mt-4 flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setViewMode("owned")}
            className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition-colors ${
              viewMode === "owned"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400"
            }`}
          >
            所持のみ
          </button>
          <button
            onClick={() => setViewMode("zukan")}
            className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition-colors ${
              viewMode === "zukan"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400"
            }`}
          >
            図鑑
          </button>
        </div>

        {/* Card grid */}
        {filteredCards.length > 0 ? (
          <motion.div
            className="mt-4 grid grid-cols-3 gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <CardTile card={card} owned={ownedIds.has(card.id)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Gift className="h-7 w-7 text-gray-400" />
            </div>
            <p className="mb-1 text-[15px] font-bold text-gray-500">
              カードがありません
            </p>
            <p className="mb-5 text-center text-[13px] text-gray-400">
              ガチャでカードを集めよう
            </p>
            <Link
              href="/gacha"
              className="rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
            >
              ガチャを引く
            </Link>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
