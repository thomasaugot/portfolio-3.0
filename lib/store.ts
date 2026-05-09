"use client"

import { create } from "zustand"

interface ContactFormStore {
  selectedBudget: string
  selectedProject: string
  setBudget: (b: string) => void
  setProject: (p: string) => void
}

export const useContactFormStore = create<ContactFormStore>((set) => ({
  selectedBudget: "",
  selectedProject: "",
  setBudget: (b) => set({ selectedBudget: b }),
  setProject: (p) => set({ selectedProject: p }),
}))
