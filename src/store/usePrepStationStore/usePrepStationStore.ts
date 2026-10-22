import { PrepStation } from "@/src/types/prep_station/prep_station.types";
import { create } from "zustand";

interface States {
  data: PrepStation | null;
  setData: (data: PrepStation) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data: boolean) => void;
}

export const usePrepStationStore = create<States>()((set) => ({
  data: null,
  setData: (data: PrepStation) => set({ data }),
  clearData: () => set({ data: null }),
  isEdit: false,
  setIsEdit: (data: boolean) => set({ isEdit: data }),
}));
