"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { FeaturedBanner } from "@/components/home/FeaturedBanner";
import { GroupCarousel } from "@/components/home/GroupCarousel";
import { CollectionProgress } from "@/components/home/CollectionProgress";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { getUser, getCoins } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setCoins(getCoins());
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <AppShell>
      <Header title="ホーム" coins={coins} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        <FeaturedBanner />
        <GroupCarousel />
        <CollectionProgress />
        {/* History link */}
        <div className="px-4 mt-2 mb-4">
          <Link href="/history">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-colors active:bg-gray-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-400/10">
                <Clock className="h-4 w-4 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-gray-900">ヒストリー</p>
                <p className="text-[11px] text-gray-400">カード取得履歴を見る</p>
              </div>
              <span className="text-[12px] text-gray-300">→</span>
            </div>
          </Link>
        </div>

        <ActivityFeed />
      </motion.div>
    </AppShell>
  );
}
