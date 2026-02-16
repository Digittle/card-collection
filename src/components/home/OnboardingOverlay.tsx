"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Gift, BookOpen, X, ChevronRight } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "ようこそ！",
    description: "カードを集めて推し活しよう！\nお気に入りのアイドルカードをコレクションできます。",
    color: "text-primary-500",
    bg: "bg-primary-50",
  },
  {
    icon: Gift,
    title: "毎日無料ガチャが引けます",
    description: "1日1回、無料でガチャが引けます。\nレアカードが出るかも…？",
    color: "text-amber-500",
    bg: "bg-amber-50",
    cta: { label: "ガチャを引きに行く", href: "/gacha" },
  },
  {
    icon: BookOpen,
    title: "コレクションを完成させよう",
    description: "全カードをコンプリートして、\n最強のコレクターを目指そう！",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
];

export function OnboardingOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("starto_onboarding_done", "true");
    }
    onClose();
  };

  const handleNext = () => {
    if (step >= STEPS.length - 1) {
      finish();
    } else {
      setStep(step + 1);
    }
  };

  const handleCta = (href: string) => {
    finish();
    router.push(href);
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden"
      >
        {/* Skip button */}
        <button
          onClick={finish}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] text-gray-500 transition-colors active:bg-gray-200"
        >
          スキップ
          <X className="h-3 w-3" />
        </button>

        {/* Icon area */}
        <div className={`flex justify-center pt-10 pb-4 ${current.bg}`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.15 }}
          >
            <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ${current.color}`}>
              <Icon className="h-10 w-10" />
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-6 text-center">
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-[14px] text-gray-500 whitespace-pre-line leading-relaxed">
            {current.description}
          </p>

          {/* CTA button for step with cta */}
          {current.cta && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleCta(current.cta!.href)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white shadow-md transition-colors active:bg-amber-600"
            >
              <Gift className="h-4 w-4" />
              {current.cta.label}
            </motion.button>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 24 : 8,
                  backgroundColor: i === step ? "var(--color-primary-500, #6366f1)" : "#e5e7eb",
                }}
              />
            ))}
          </div>

          {/* Next / Finish button */}
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 py-3 text-[15px] font-bold text-white shadow-sm transition-colors active:bg-primary-600"
          >
            {step >= STEPS.length - 1 ? "はじめる！" : "次へ"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
