
import { create } from 'zustand';

interface ConfettiState {
  isActive: boolean;
  fire: () => void;
  reset: () => void;
}

export const useConfettiStore = create<ConfettiState>((set) => ({
  isActive: false,
  fire: () => {
    set({ isActive: true });
    // Auto-reset after animation completes
    setTimeout(() => {
      set({ isActive: false });
    }, 3000);
  },
  reset: () => set({ isActive: false }),
}));
