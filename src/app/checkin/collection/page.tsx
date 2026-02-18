"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { CollectionCard } from "@/components/checkin/CollectionCard";
import { CardDetailModal } from "@/components/checkin/CardDetailModal";

import { getUser } from "@/lib/store";
import {
  getCheckinCards,
  getCheckinCount,
  initializeCheckinCards,
  CheckinCard,
} from "@/lib/checkin-store";
import { CHECKIN_MILESTONE_CARDS } from "@/lib/checkin-cards";

export default function CheckinCollectionPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<CheckinCard[]>([]);
  const [checkinCount, setCheckinCount] = useState(0);
  const [selectedCard, setSelectedCard] = useState<CheckinCard | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    // Initialize milestone cards if needed
    initializeCheckinCards(CHECKIN_MILESTONE_CARDS);

    // Load data
    setCards(getCheckinCards());
    setCheckinCount(getCheckinCount());
    setReady(true);
  }, [router]);

  const handleCardClick = (card: CheckinCard) => {
    if (card.unlocked) {
      setSelectedCard(card);
      setShowDetailModal(true);
    }
  };

  const unlockedCount = cards.filter(card => card.unlocked).length;
  const totalCount = cards.length;

  if (!ready) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#F4F5F6]">
        <Header 
          title="カードコレクション" 
          showBack={true}
        />

        <div className="px-4 pt-6 pb-8">
          {/* Collection Stats */}
          <motion.div
            className="bg-white rounded-2xl p-6 mb-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-900">コレクション進度</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {unlockedCount}
                  </div>
                  <div className="text-sm text-gray-600">獲得済み</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {checkinCount}
                  </div>
                  <div className="text-sm text-gray-600">総チェックイン</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="text-sm text-gray-500">
                {unlockedCount} / {totalCount} カード ({Math.round((unlockedCount / totalCount) * 100)}%)
              </div>
            </div>
          </motion.div>

          {/* Collection Grid */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <h3 className="font-bold text-lg text-gray-900">チェックイン記念カード</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {cards.map((card, index) => (
                <CollectionCard
                  key={card.id}
                  card={card}
                  index={index}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-center text-sm text-gray-500 mb-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-primary-500 to-amber-500 rounded border-2 border-amber-500"></div>
                    <span>獲得済み</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded border-2 border-gray-300 flex items-center justify-center">
                      <Lock className="h-2 w-2 text-gray-500" />
                    </div>
                    <span>未獲得</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-gray-400">
                カードをタップして詳細を確認できます
              </p>
            </div>
          </motion.div>

          {/* Motivation message */}
          <motion.div
            className="mt-6 text-center p-6 bg-gradient-to-r from-primary-50 to-amber-50 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="text-2xl mb-2">✨</div>
            {unlockedCount === totalCount ? (
              <>
                <div className="font-bold text-primary-700 mb-2">
                  🎉 全てのカードを獲得しました！
                </div>
                <div className="text-sm text-primary-600">
                  あなたは真の推し活マスターです！
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-primary-700 mb-2">
                  チェックインを続けて全てのカードを集めよう！
                </div>
                <div className="text-sm text-primary-600">
                  推し活の記録があなたの宝物になります✨
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        isOpen={showDetailModal}
        card={selectedCard}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCard(null);
        }}
      />
    </AppShell>
  );
}