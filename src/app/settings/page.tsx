"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Trash2,
  LogOut,
  Download,
  Info,
  ChevronRight,
  AlertTriangle,
  LayoutGrid,
} from "lucide-react";
import { getUser, getCards, clearUser } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [cardCount, setCardCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setUserName(user.displayName);
    setCardCount(getCards().length);
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    clearUser();
    router.replace("/");
  };

  const handleClearData = () => {
    localStorage.clear();
    router.replace("/");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  return (
    <AppShell>
      <Header title="設定" />

      <div className="px-4 py-6">
        {/* User profile card */}
        <motion.div
          className="mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/40 to-primary-100/20">
              <User className="h-7 w-7 text-primary-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-[17px] font-bold text-white">{userName}</h2>
              <div className="mt-1 flex items-center gap-1.5 text-[13px] text-white/50">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>カード {cardCount}枚 所持</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings list */}
        <div className="space-y-1.5">
          <SettingsItem
            icon={<Download className="h-5 w-5" />}
            label="ホーム画面に追加"
            description="PWAとしてインストール"
          />

          <SettingsItem
            icon={<Info className="h-5 w-5" />}
            label="アプリについて"
            description="Digital Card Collection v1.0.0"
          />

          <div className="my-4 h-px bg-white/10" />

          <SettingsItem
            icon={<LogOut className="h-5 w-5" />}
            label="ログアウト"
            description="アカウント情報を保持したまま退出"
            onClick={() => setShowLogoutConfirm(true)}
            danger
          />

          <SettingsItem
            icon={<Trash2 className="h-5 w-5" />}
            label="データの全削除"
            description="すべてのカードとアカウントを削除"
            onClick={() => setShowConfirm(true)}
            danger
          />
        </div>
      </div>

      {/* Logout confirm dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e]/95 p-6 shadow-2xl backdrop-blur-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="mb-2 text-[17px] font-bold text-white">
              ログアウトしますか？
            </h3>
            <p className="mb-6 text-[14px] text-white/50">
              コレクションデータは保持されます
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 py-3 text-[14px] font-medium text-white/60 transition-all active:bg-white/10"
              >
                キャンセル
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-red-600 py-3 text-[14px] font-bold text-white transition-all active:bg-red-500"
              >
                ログアウト
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Data delete confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e]/95 p-6 shadow-2xl backdrop-blur-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-[17px] font-bold text-white">
                データを削除しますか？
              </h3>
            </div>
            <p className="mb-3 text-[13px] text-white/50">
              以下のデータが完全に削除されます
            </p>
            <div className="mb-4 space-y-2 rounded-xl bg-white/5 p-3">
              <p className="text-[13px] text-white/60">
                ・アカウント情報（{userName}）
              </p>
              <p className="text-[13px] text-white/60">
                ・コレクション（カード {cardCount}枚）
              </p>
              <p className="text-[13px] text-white/60">・受け取り履歴</p>
            </div>
            <p className="mb-6 text-[12px] font-medium text-red-400/80">
              この操作は取り消せません
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 py-3 text-[14px] font-medium text-white/60 transition-all active:bg-white/10"
              >
                キャンセル
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 rounded-xl bg-red-600 py-3 text-[14px] font-bold text-white transition-all active:bg-red-500"
              >
                削除する
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}

function SettingsItem({
  icon,
  label,
  description,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl p-3.5 text-left transition-all active:bg-white/5"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          danger
            ? "bg-red-500/10 text-red-400"
            : "bg-white/5 text-white/40"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p
          className={`text-[14px] font-medium ${
            danger ? "text-red-400" : "text-white"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-[12px] text-white/40">{description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-white/20" />
    </button>
  );
}
