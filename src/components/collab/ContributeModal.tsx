"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Card, CollaborativeProgram, RARITY_CONFIG } from "@/types";
import { getCardRightsSummary } from "@/lib/rights-engine";

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: CollaborativeProgram;
  eligibleCards: Card[];
  onSelectCard: (card: Card) => void;
  selectedCard: Card | null;
  onConfirm: () => void;
  isConfirming: boolean;
}

export function ContributeModal({
  isOpen,
  onClose,
  program,
  eligibleCards,
  onSelectCard,
  selectedCard,
  onConfirm,
  isConfirming,
}: ContributeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-bold text-gray-900">権利を投じる</h3>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {!selectedCard ? (
              /* Card Selection */
              <div className="max-h-[50vh] overflow-y-auto px-5 py-4">
                <p className="mb-3 text-xs text-gray-500">
                  投じるカードを選択してください
                </p>
                {eligibleCards.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    対象カードがありません
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eligibleCards.map((card) => {
                      const summary = getCardRightsSummary(card.id);
                      const config = RARITY_CONFIG[card.rarity];
                      return (
                        <motion.button
                          key={card.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectCard(card)}
                          className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition-colors hover:bg-gray-50"
                        >
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{card.title}</span>
                              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${config.textColor} ${config.bgGradient.includes("slate") ? "bg-slate-100" : config.bgGradient.includes("blue") ? "bg-blue-100" : config.bgGradient.includes("purple") ? "bg-purple-100" : "bg-amber-100"}`}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              残り権利: {summary.available} / {summary.total}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Confirmation */
              <div className="px-5 py-4">
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.title}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedCard.title}</p>
                    <p className="text-xs text-gray-500">
                      「{program.title}」に1ポイント投入
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-700">
                    この操作は取り消せません。カードの権利1ポイントが消費されます。
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => onSelectCard(null as unknown as Card)}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600"
                  >
                    戻る
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onConfirm}
                    disabled={isConfirming}
                    className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
                    style={{ backgroundColor: program.accentColor }}
                  >
                    {isConfirming ? "処理中..." : "投じる"}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
