"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  title: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant: "primary" | "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  children?: React.ReactNode;
}

const VARIANT_STYLES = {
  primary: {
    confirmBg:
      "bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-500/20",
    confirmText: "text-white",
    warningText: "text-primary-400",
    warningBg: "bg-primary-500/10",
  },
  danger: {
    confirmBg:
      "bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/20",
    confirmText: "text-white",
    warningText: "text-red-400",
    warningBg: "bg-red-500/10",
  },
  warning: {
    confirmBg:
      "bg-gradient-to-r from-amber-500 to-amber-400 shadow-lg shadow-amber-400/20",
    confirmText: "text-white",
    warningText: "text-amber-400",
    warningBg: "bg-amber-500/10",
  },
};

export function ConfirmationModal({
  title,
  description,
  warning,
  confirmLabel,
  cancelLabel = "キャンセル",
  variant,
  onConfirm,
  onCancel,
  isProcessing = false,
  children,
}: ConfirmationModalProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isProcessing) onCancel();
        }}
      >
        <motion.div
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a2e]/95 shadow-2xl backdrop-blur-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              {description}
            </p>

            {warning && (
              <motion.div
                className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 ${styles.warningBg}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AlertTriangle className={`h-4 w-4 shrink-0 ${styles.warningText}`} />
                <span className={`text-xs font-medium ${styles.warningText}`}>
                  {warning}
                </span>
              </motion.div>
            )}

            {children && <div className="mt-4">{children}</div>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/60 transition-colors active:bg-white/10 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-60 ${styles.confirmBg} ${styles.confirmText}`}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
