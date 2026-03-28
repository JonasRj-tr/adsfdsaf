import { create } from 'zustand';

interface SettingsState {
  whatsappNumber: string;
  deliveryFee: number;
  setSettings: (settings: { whatsappNumber: string; deliveryFee: number }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  whatsappNumber: '5511999999999',
  deliveryFee: 5,
  setSettings: (settings) => set(settings),
}));
