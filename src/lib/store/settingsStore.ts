"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiscPattern = "solid" | "circle" | "stripe";
export type Theme = "light" | "dark" | "system";

interface SettingsState {
  highContrast: boolean;
  discPattern: DiscPattern;
  reducedMotion: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  showHints: boolean;
  showColumnNumbers: boolean;
  setHighContrast: (v: boolean) => void;
  setDiscPattern: (v: DiscPattern) => void;
  setReducedMotion: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setSoundVolume: (v: number) => void;
  setShowHints: (v: boolean) => void;
  setShowColumnNumbers: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      highContrast: false,
      discPattern: "solid",
      reducedMotion: false,
      soundEnabled: true,
      soundVolume: 0.7,
      showHints: true,
      showColumnNumbers: false,
      setHighContrast: (v) => set({ highContrast: v }),
      setDiscPattern: (v) => set({ discPattern: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setSoundVolume: (v) => set({ soundVolume: v }),
      setShowHints: (v) => set({ showHints: v }),
      setShowColumnNumbers: (v) => set({ showColumnNumbers: v }),
    }),
    { name: "inferno-settings" },
  ),
);
