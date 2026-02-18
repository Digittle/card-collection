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
  Coins,
  Heart,
} from "lucide-react";
import { getUser, getCards, getCoins, clearUser, clearAllData } from "@/lib/store";
import { getMemberById } from "@/lib/groups-data";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [cardCount, setCardCount] = useState(0);
  const [coins, setCoinsState] = useState(0);
  const [tanmouName, setTanmouName] = useState<string | null>(null);
  const [tanmouColor, setTanmouColor] = useState<string | null>(null);
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
    setCoinsState(getCoins());

    if (user.tanmouMemberId) {
      const member = getMemberById(user.tanmouMemberId);
      if (member) {
        setTanmouName(member.name);
        setTanmouColor(member.color);
      }
    }
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    clearUser();
    router.replace("/");
  };

  const handleClearData = () => {
    clearAllData();
    router.replace("/");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  return (
    <AppShell>
      <Header title="設定" />

      <div className="px-4 py-6">
        {/* User profile card */}
        <motion.div
          className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/40 to-primary-100/20">
              <User className="h-7 w-7 text-primary-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-[17px] font-bold text-gray-900">{userName}</h2>
              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-gray-500">
                {tanmouName ? (
                  <>
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tanmouColor || "#888" }}
                    />
                    <span>担当: {tanmouName}</span>
                  </>
                ) : (
                  <span className="text-gray-400">担当なし</span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-[12px] text-gray-400">
                <div className="flex items-center gap-1">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>カード {cardCount}枚所持</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />
                  <span>コイン {coins.toLocaleString()}枚</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings list */}
        <div className="space-y-1.5">
          <SettingsItem
            icon={<Heart className="h-5 w-5" />}
            label="担当を変更"
            description={tanmouName ? `現在: ${tanmouName}` : "担当メンバーを選択"}
            onClick={() => router.push("/login")}
          />

          <SettingsItem
            icon={<Download className="h-5 w-5" />}
            label="ホーム画面に追加"
            description="PWAとしてインストール"
          />

          <SettingsItem
            icon={<Info className="h-5 w-5" />}
            label="アプリについて"
            description="STARTO Card Collection v1.0.0"
          />

          <div className="my-4 h-px bg-gray-200" />

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
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="mb-2 text-[17px] font-bold text-gray-900">
              ログアウトしますか？
            </h3>
            <p className="mb-6 text-[14px] text-gray-500">
              コレクションデータは保持されます
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-[14px] font-medium text-gray-500 transition-all active:bg-gray-100"
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
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900">
                データを削除しますか？
              </h3>
            </div>
            <p className="mb-3 text-[13px] text-gray-500">
              以下のデータが完全に削除されます
            </p>
            <div className="mb-4 space-y-2 rounded-xl bg-gray-50 p-3">
              <p className="text-[13px] text-gray-600">
                ・アカウント情報（{userName}）
              </p>
              <p className="text-[13px] text-gray-600">
                ・コレクション（カード {cardCount}枚）
              </p>
              <p className="text-[13px] text-gray-600">・コイン残高</p>
              <p className="text-[13px] text-gray-600">・受け取り履歴</p>
            </div>
            <p className="mb-6 text-[12px] font-medium text-red-400/80">
              この操作は取り消せません
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-[14px] font-medium text-gray-500 transition-all active:bg-gray-100"
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
      className="flex w-full items-center gap-4 rounded-xl p-3.5 text-left transition-all active:bg-gray-100"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          danger
            ? "bg-red-500/10 text-red-400"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p
          className={`text-[14px] font-medium ${
            danger ? "text-red-400" : "text-gray-900"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-[12px] text-gray-500">{description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300" />
    </button>
  );
}
