"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CollabProgramProgress,
  CollabFeedItem,
  CollaborativeProgram,
} from "@/types";
import { simulateTick, catchUpSimulation, SimulationResult } from "@/lib/collab-simulator";
import { getCollabProgress } from "@/lib/collab-store";

interface UseCollabSimulatorOptions {
  program: CollaborativeProgram;
  enabled?: boolean;
}

interface UseCollabSimulatorReturn {
  progress: CollabProgramProgress | null;
  latestFeedItems: CollabFeedItem[];
  goalReached: boolean;
  milestoneReached: number | null;
  refresh: () => void;
}

export function useCollabSimulator({
  program,
  enabled = true,
}: UseCollabSimulatorOptions): UseCollabSimulatorReturn {
  const [progress, setProgress] = useState<CollabProgramProgress | null>(null);
  const [latestFeedItems, setLatestFeedItems] = useState<CollabFeedItem[]>([]);
  const [goalReached, setGoalReached] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  const refresh = useCallback(() => {
    const p = getCollabProgress(program.id);
    setProgress(p || null);
  }, [program.id]);

  // Initial load + catch-up
  useEffect(() => {
    catchUpSimulation(program);
    refresh();
  }, [program, refresh]);

  // Simulation interval
  useEffect(() => {
    if (!enabled) return;

    const currentProgress = getCollabProgress(program.id);
    if (currentProgress?.status === "completed") return;

    function tick() {
      if (!isVisibleRef.current) return;

      const result = simulateTick(program);
      if (result) {
        setProgress(result.updatedProgress);
        setLatestFeedItems(result.newFeedItems);

        if (result.goalReached) {
          setGoalReached(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }

        if (result.milestoneReached) {
          setMilestoneReached(result.milestoneReached);
          // Clear milestone after a delay
          setTimeout(() => setMilestoneReached(null), 3000);
        }
      }

      // Schedule next tick with random interval (5-15 seconds)
      if (intervalRef.current) clearInterval(intervalRef.current);
      const nextDelay = 5000 + Math.random() * 10000;
      intervalRef.current = setInterval(tick, nextDelay);
    }

    // Start first tick after a short delay
    const initialDelay = 3000 + Math.random() * 5000;
    const initialTimer = setTimeout(() => {
      tick();
    }, initialDelay);

    // Visibility change handler
    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        // Catch up when coming back
        catchUpSimulation(program);
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [program, enabled, refresh]);

  return {
    progress,
    latestFeedItems,
    goalReached,
    milestoneReached,
    refresh,
  };
}
