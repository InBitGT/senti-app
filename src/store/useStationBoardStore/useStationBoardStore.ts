import { create } from "zustand";

interface States {
  stationIds: number[];
  setStationIds: (stationIds: number[]) => void;
  clearStationIds: () => void;
}

export const useStationBoardStore = create<States>()((set) => ({
  stationIds: [],
  setStationIds: (stationIds: number[]) => set({ stationIds }),
  clearStationIds: () => set({ stationIds: [] }),
}));
