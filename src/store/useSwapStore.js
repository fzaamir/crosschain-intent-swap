import { create } from 'zustand';

export const useSwapStore = create((set) => ({
  step: 1,
  intentData: {
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    chainIn: 'Ethereum',
    chainOut: 'Arbitrum',
    amountIn: '100',
    minAmountOut: '0.05',
    expiry: '15 min'
  },
  darkMode: false,
  setStep: (step) => set({ step }),
  updateIntent: (data) => set((state) => ({
    intentData: { ...state.intentData, ...data }
  })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
}));