import { create } from 'zustand';

export const useStore = create((set) => ({
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  closeChat: () => set({ isChatOpen: false }),
}));
