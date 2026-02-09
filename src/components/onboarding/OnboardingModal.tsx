"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, LayoutGrid, Sparkles, ArrowRight, X } from "lucide-react";
import { completeOnboarding } from "@/lib/store";

interface OnboardingModalProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Gift,
    title: "カードを受け取ろう",
    description:
      "コードを入力するか、URLを開いてデジタルカードを受け取れます",
    color: "text-primary-400",
    bgFrom: "from-primary-600/20",
    bgTo: "to-primary-600/5",
    accentColor: "#ec6d81",
  },
  {
    icon: Sparkles,
    title: "開封の瞬間を楽しもう",
    description:
      "カードをタップして開封！レアリティによって特別な演出が変わります",
    color: "text-gold-400",
    bgFrom: "from-gold-400/20",
    bgTo: "to-gold-400/5",
    accentColor: "#f6ab00",
  },
  {
    icon: LayoutGrid,
    title: "コレクションしよう",
    description:
      "受け取ったカードはコレクションに追加されます。すべて集めてコンプリートを目指しましょう！",
    color: "text-matcha-300",
    bgFrom: "from-matcha-400/20",
    bgTo: "to-matcha-400/5",
    accentColor: "#90c31f",
  },
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      onComplete();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    onComplete();
  };

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Top accent bar */}
        <motion.div
          className="h-1"
          style={{ background: currentStep.accentColor }}
          layoutId="accent"
        />

        <div className="p-8">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors active:bg-black/5 active:text-gray-900"
            aria-label="スキップ"
          >
            <X className="h-5 w-5" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center"
            >
              <div
                className={`mb-7 flex h-24 w-24 items-center justify-center rounded-[22px] bg-gradient-to-br ${currentStep.bgFrom} ${currentStep.bgTo}`}
              >
                <Icon className={`h-12 w-12 ${currentStep.color}`} />
              </div>
              <h2 className="mb-3 text-[20px] font-bold text-gray-900">
                {currentStep.title}
              </h2>
              <p className="text-[14px] leading-[1.7] text-gray-500">
                {currentStep.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step indicator */}
          <div className="mt-8 flex flex-col items-center gap-2.5">
            <span className="text-[12px] font-medium text-gray-500">
              {step + 1}/{STEPS.length}
            </span>
            <div className="flex justify-center gap-2">
              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  className="h-2 rounded-full transition-all"
                  animate={{
                    width: i === step ? 24 : 8,
                    backgroundColor:
                      i === step ? currentStep.accentColor : "#d1d5db",
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
            >
              {step === STEPS.length - 1 ? "はじめる" : "次へ"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
