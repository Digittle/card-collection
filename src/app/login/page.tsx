"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { User as UserIcon, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { setUser, setCoins, getUser } from "@/lib/store";
import { GROUPS, MEMBERS, getMembersByGroup } from "@/lib/groups-data";
import { INITIAL_COINS } from "@/types";
import type { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(GROUPS[0].id);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace("/home");
    }
  }, [router]);

  const groupMembers = getMembersByGroup(selectedGroupId);
  const selectedMember = selectedMemberId
    ? MEMBERS.find((m) => m.id === selectedMemberId)
    : null;

  const handleNext = () => {
    if (!name.trim()) return;
    setStep(2);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    setIsSubmitting(true);

    const tanmouGroupId = selectedMember
      ? selectedMember.groupId
      : null;

    const user: User = {
      id: crypto.randomUUID(),
      displayName: name.trim(),
      tanmouMemberId: selectedMemberId,
      tanmouGroupId: tanmouGroupId,
      createdAt: new Date().toISOString(),
    };

    setUser(user);
    setCoins(INITIAL_COINS);

    setTimeout(() => {
      router.push("/home");
    }, 300);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] px-6">
      {/* Ambient background */}
      <div className="ambient-glow left-[30%] top-[25%] h-[300px] w-[300px] bg-primary-400/15" />
      <div
        className="ambient-glow right-[20%] top-[60%] h-[250px] w-[250px] bg-amber-400/10"
        style={{ animationDelay: "-8s" }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Name entry */}
              <div className="mb-10 flex flex-col items-center text-center">
                <motion.div
                  className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/40 to-primary-100/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <UserIcon className="h-10 w-10 text-primary-500" />
                </motion.div>
                <h1 className="mb-2 text-[24px] font-bold text-white">
                  ようこそ
                </h1>
                <p className="text-[14px] leading-relaxed text-white/50">
                  まずはニックネームを教えてください
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleNext();
                    }}
                    placeholder="ニックネームを入力"
                    maxLength={20}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-[15px] text-white placeholder-white/30 outline-none transition-all focus:border-primary-400 focus:bg-white/10 focus:ring-2 focus:ring-primary-400/20"
                  />
                </div>

                <button
                  onClick={handleNext}
                  disabled={!name.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-4 text-[15px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                >
                  次へ
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              {/* Back button */}
              <button
                onClick={() => setStep(1)}
                className="mb-6 flex items-center gap-1 text-[14px] text-white/50 transition-colors hover:text-white/80 self-start"
              >
                <ArrowLeft className="h-4 w-4" />
                戻る
              </button>

              {/* Step 2: 担当選択 */}
              <h1 className="mb-2 text-center text-[22px] font-bold text-white">
                担当を選んでください
              </h1>
              <p className="mb-6 text-center text-[13px] text-white/40">
                あとから変更できます
              </p>

              {/* Group tabs */}
              <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {GROUPS.map((group) => {
                  const isActive = selectedGroupId === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className="shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all"
                      style={{
                        backgroundColor: isActive
                          ? group.accentColor
                          : "rgba(255,255,255,0.05)",
                        color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {group.name}
                    </button>
                  );
                })}
              </div>

              {/* Member grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedGroupId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-3 gap-3 mb-4"
                >
                  {groupMembers.map((member) => {
                    const isSelected = selectedMemberId === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() =>
                          setSelectedMemberId(
                            isSelected ? null : member.id
                          )
                        }
                        className="flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all"
                        style={{
                          borderColor: isSelected
                            ? member.color
                            : "rgba(255,255,255,0.06)",
                          backgroundColor: isSelected
                            ? `${member.color}15`
                            : "rgba(255,255,255,0.03)",
                          boxShadow: isSelected
                            ? `0 0 20px ${member.color}30, 0 0 40px ${member.color}15`
                            : "none",
                        }}
                      >
                        {/* Member photo */}
                        <div
                          className="relative h-14 w-14 overflow-hidden rounded-full border-2"
                          style={{
                            borderColor: isSelected
                              ? member.color
                              : "rgba(255,255,255,0.1)",
                            boxShadow: isSelected
                              ? `0 0 12px ${member.color}60`
                              : "none",
                          }}
                        >
                          {member.image ? (
                            <Image
                              src={`/members/${member.image}`}
                              alt={member.name}
                              fill
                              className="object-cover object-top"
                              sizes="56px"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center text-[14px] font-bold text-white"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.name.charAt(0)}
                            </div>
                          )}
                          {isSelected && (
                            <motion.div
                              className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <Check
                                className="h-3 w-3"
                                style={{ color: member.color }}
                              />
                            </motion.div>
                          )}
                        </div>
                        <span
                          className="text-[12px] font-medium leading-tight text-center"
                          style={{
                            color: isSelected
                              ? "#fff"
                              : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {member.name}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Skip option */}
              <button
                onClick={() => setSelectedMemberId(null)}
                className="mb-5 text-[13px] text-white/40 transition-colors hover:text-white/60"
              >
                {selectedMemberId === null ? (
                  <span className="text-primary-400">✓ </span>
                ) : null}
                担当なし（スキップ）
              </button>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-amber-500 py-4 text-[15px] font-bold text-white shadow-lg shadow-amber-500/15 transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    はじめる
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
