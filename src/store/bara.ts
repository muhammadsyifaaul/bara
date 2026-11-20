"use client";

import { create } from "zustand";

export type Ambiance = "lunch" | "dinner";
export type CourseIndex = 0 | 1 | 2 | 3;

interface BaraState {
  ambiance: Ambiance;
  activeCourse: CourseIndex;
  clocheOpen: boolean;
  setAmbiance: (a: Ambiance) => void;
  setActiveCourse: (i: CourseIndex) => void;
  toggleCloche: () => void;
  openCloche: () => void;
  closeCloche: () => void;
}

export const useBaraStore = create<BaraState>((set) => ({
  ambiance: "lunch",
  activeCourse: 0,
  clocheOpen: false,

  setAmbiance: (ambiance) => {
    set({ ambiance });
    // Sync data-theme attribute for CSS token switching
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme =
        ambiance === "dinner" ? "dinner" : "";
    }
  },

  setActiveCourse: (activeCourse) => set({ activeCourse }),

  toggleCloche: () => set((s) => ({ clocheOpen: !s.clocheOpen })),
  openCloche:   () => set({ clocheOpen: true }),
  closeCloche:  () => set({ clocheOpen: false }),
}));
