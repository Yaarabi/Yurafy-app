

import { create } from "zustand";

interface WhatsappState {
    connected: boolean | null; 
    setConnected: (val: boolean) => void;
}

export const useWhatsappStore = create<WhatsappState>((set) => ({
    connected: null,
    setConnected: (val) => set({ connected: val }),
}));
