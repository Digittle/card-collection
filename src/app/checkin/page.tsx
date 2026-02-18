"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid, Heart } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { CheckinButton } from "@/components/checkin/CheckinButton";
import { CheckinHistory } from "@/components/checkin/CheckinHistory";
import { CheckinStats } from "@/components/checkin/CheckinStats";
import { CardUnlockModal } from "@/components/checkin/CardUnlockModal";

import { getUser } from "@/lib/store";
import {
  getCheckinCount,
  getCheckinHistory,
  getCheckinStats,
  addCheckinEntry,
  markCheckinToday,
  checkMilestoneRewards,
  initializeCheckinCards,
  CheckinEntry,
  CheckinCard,
} from "@/lib/checkin-store";
import { 
  CHECKIN_MILESTONE_CARDS,
  getNextMilestone,
} from "@/lib/checkin-cards";

export default function CheckinPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({
    totalCount: 0,
    streak: 0,
    todaysCount: 0,
    canCheckinToday: true,
  });
  const [history, setHistory] = useState<CheckinEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unlockedCards, setUnlockedCards] = useState<CheckinCard[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    // Initialize milestone cards if needed
    initializeCheckinCards(CHECKIN_MILESTONE_CARDS);

    // Load initial data
    setStats(getCheckinStats());
    setHistory(getCheckinHistory());
    setReady(true);
  }, [router]);

  const handleCheckin = async () => {
    if (!stats.canCheckinToday || isLoading) return;

    setIsLoading(true);

    try {
      // Add check-in entry
      addCheckinEntry("推し活頑張りました！");
      markCheckinToday();

      // Check for milestone rewards
      const newUnlocks = checkMilestoneRewards();
      
      // Update state
      const newStats = getCheckinStats();
      const newHistory = getCheckinHistory();
      
      setStats(newStats);
      setHistory(newHistory);

      // Show unlock modal if there are new cards
      if (newUnlocks.length > 0) {
        setUnlockedCards(newUnlocks);
        setShowUnlockModal(true);
      }
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextMilestone = getNextMilestone(stats.totalCount);
  const nextMilestoneInfo = nextMilestone ? {
    milestone: nextMilestone.milestone,
    title: nextMilestone.title,
    remaining: nextMilestone.milestone - stats.totalCount,
  } : undefined;

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
        <Header title="推し活チェックイン" />
        
        <div className="px-4 pt-6 pb-8 space-y-6">
          {/* Welcome Section */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-3xl mb-2">💝</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              推し活を記録しよう
            </h1>
            <p className="text-gray-600">
              チェックインしてカードを集めましょう！
            </p>
          </motion.div>

          {/* Check-in Button */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <CheckinButton
              canCheckin={stats.canCheckinToday}
              onCheckin={handleCheckin}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <CheckinStats
              totalCount={stats.totalCount}
              streak={stats.streak}
              todaysCount={stats.todaysCount}
              nextMilestone={nextMilestoneInfo}
            />
          </motion.div>

          {/* Collection Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Link
              href="/checkin/collection"
              className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <LayoutGrid className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      カードコレクション
                    </div>
                    <div className="text-sm text-gray-600">
                      獲得したカードを確認する
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </Link>
          </motion.div>

          {/* Recent History */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <CheckinHistory history={history} limit={5} />
          </motion.div>
        </div>
      </div>

      {/* Card Unlock Modal */}
      <CardUnlockModal
        isOpen={showUnlockModal}
        cards={unlockedCards}
        onClose={() => setShowUnlockModal(false)}
      />
    </AppShell>
  );
}