"use client";

import { useRouter } from "next/navigation";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { hasReceivedFreeCard } from "@/lib/store";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    if (!hasReceivedFreeCard()) {
      router.push("/gift");
    } else {
      router.push("/collection");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <OnboardingModal onComplete={handleComplete} />
    </div>
  );
}
