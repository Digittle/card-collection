"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  KeyRound,
  AlertCircle,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getUser, addCard, hasClaimedToken, addClaimHistory } from "@/lib/store";
import { validateToken } from "@/lib/cards-data";
import { Card } from "@/types";
import { CardFlip } from "@/components/card/CardFlip";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";

type ClaimState = "input" | "revealing" | "complete";

export default function ClaimPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [claimState, setClaimState] = useState<ClaimState>("input");
  const [claimedCard, setClaimedCard] = useState<Card | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setMounted(true);
  }, [router]);

  const handleClaim = () => {
    setError("");

    if (!code.trim()) {
      setError(
        "コードを入力してください。大文字・ハイフンを含む形式（例: PHOENIX-2024）です"
      );
      return;
    }

    if (hasClaimedToken(code.trim().toUpperCase())) {
      setError(
        "このコードは既に使用済みです。別のコードをお持ちの場合は、そちらを入力してください"
      );
      return;
    }

    const result = validateToken(code.trim());

    if (!result.valid) {
      setError(result.reason);
      return;
    }

    addClaimHistory(code.trim().toUpperCase());
    setClaimedCard(result.card);
    setClaimState("revealing");
  };

  const handleRevealComplete = () => {
    if (claimedCard) {
      addCard(claimedCard);
      setClaimState("complete");
    }
  };

  const handleReset = () => {
    setCode("");
    setError("");
    setClaimState("input");
    setClaimedCard(null);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  return (
    <AppShell>
      <Header title="カードを受け取る" />

      <div className="flex min-h-[calc(100vh-130px)] flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {/* Input State */}
          {claimState === "input" && (
            <motion.div
              key="input"
              className="w-full max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 flex flex-col items-center text-center">
                <motion.div
                  className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/40 to-primary-100/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <Gift className="h-10 w-10 text-primary-500" />
                </motion.div>
                <h2 className="mb-2 text-[20px] font-bold text-gray-900">
                  コードで受け取る
                </h2>
                <p className="text-[14px] leading-relaxed text-gray-500">
                  カードのコードを入力して
                  <br />
                  新しいカードを受け取りましょう
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="例: PHOENIX-2024"
                    className="w-full rounded-2xl border border-gray-300 bg-white py-4 pl-12 pr-4 font-mono text-[15px] text-gray-900 uppercase placeholder-gray-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-400/20"
                    onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                  />
                </div>

                {/* Error - shown directly below input per guidelines */}
                {error && (
                  <motion.div
                    className="flex items-start gap-2.5 rounded-xl bg-red-500/8 p-3.5 text-[13px] leading-relaxed text-red-400"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  onClick={handleClaim}
                  disabled={!code.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-4 text-[15px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                >
                  受け取る
                  <Gift className="h-5 w-5" />
                </button>
              </div>

              {/* Demo codes */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-[12px] font-medium text-gray-400">
                  お試し用のコードをタップして入力できます
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "PHOENIX-2024",
                    "DRAGON-2024",
                    "SPIRIT-2024",
                    "GOLEM-2024",
                  ].map((demoCode) => (
                    <button
                      key={demoCode}
                      onClick={() => setCode(demoCode)}
                      className="rounded-xl bg-gray-100 px-3 py-1.5 font-mono text-[12px] text-gray-600 transition-all active:scale-[0.97] active:bg-gray-200"
                    >
                      {demoCode}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Revealing State */}
          {claimState === "revealing" && claimedCard && (
            <motion.div
              key="revealing"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardFlip
                card={claimedCard}
                onComplete={handleRevealComplete}
                isFirstTime={true}
              />
            </motion.div>
          )}

          {/* Complete State */}
          {claimState === "complete" && claimedCard && (
            <motion.div
              key="complete"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-matcha-400/20 to-matcha-300/10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                <Sparkles className="h-10 w-10 text-matcha-500" />
              </motion.div>
              <h2 className="mb-2 text-[22px] font-bold text-gray-900">
                おめでとうございます！
              </h2>
              <p className="mb-8 text-[14px] text-gray-500">
                「{claimedCard.title}」がコレクションに追加されました
              </p>

              <div className="flex w-full max-w-xs flex-col gap-3">
                <button
                  onClick={() => router.push(`/card/${claimedCard.id}`)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.98]"
                >
                  カードを見る
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-2xl border border-gray-200 bg-gray-50 py-3.5 text-[14px] font-medium text-gray-600 transition-all active:scale-[0.98] active:bg-gray-100"
                >
                  別のカードを受け取る
                </button>
                <button
                  onClick={() => router.push("/collection")}
                  className="py-2 text-[13px] text-gray-400 transition-colors active:text-gray-600"
                >
                  コレクションへ戻る
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
