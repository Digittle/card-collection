"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
        <ActivityFeed />
      </motion.div>
    </AppShell>
  );
}
