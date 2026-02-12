"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Program, UserProgramProgress } from "@/types";
import {
  getUser,
  getCoins,
  getProgramProgresses,
} from "@/lib/store";
import { getAllPrograms } from "@/lib/programs-data";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { ProgramCard } from "@/components/ui/ProgramCard";

function getFilledRequirements(
  program: Program,
  progress?: UserProgramProgress
): number {
  if (!progress) return 0;
  return program.requirements.filter((req) => {
    const allocated = progress.allocations[req.id] || [];
    return allocated.length >= req.rightPointsNeeded;
  }).length;
}

export default function ProgramsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [coins, setCoins] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [progresses, setProgresses] = useState<UserProgramProgress[]>([]);
  const refreshState = () => {
    setCoins(getCoins());
    setPrograms(getAllPrograms().filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
    setProgresses(getProgramProgresses());
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    refreshState();
    setMounted(true);
  }, [router]);

  useEffect(() => {
    const handleFocus = () => refreshState();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        refreshState();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  return (
    <AppShell>
      <Header title="プログラム" coins={coins} />

      {/* Program List */}
      {programs.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center px-4 py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg shadow-black/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <Target className="h-11 w-11 text-gray-400" />
          </motion.div>
          <h3 className="mb-2 text-[17px] font-bold text-gray-700">
            プログラムがありません
          </h3>
          <p className="text-center text-[14px] leading-relaxed text-gray-400">
            現在参加可能なプログラムはありません
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3 px-4 pt-3 pb-6">
          {programs.map((program, index) => {
            const progress = progresses.find(
              (p) => p.programId === program.id
            );
            const filledCount = getFilledRequirements(program, progress);
            const totalRequirements = program.requirements.length;

            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.15 + index * 0.1,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <ProgramCard
                  program={program}
                  progress={progress}
                  filledRequirements={filledCount}
                  totalRequirements={totalRequirements}
                  onClick={() => router.push(`/programs/${program.id}`)}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
