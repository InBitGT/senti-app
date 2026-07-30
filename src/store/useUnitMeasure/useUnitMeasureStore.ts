import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import { create } from "zustand";

interface States {
  data: UnitOfMeasure | null;
  setData: (data: UnitOfMeasure) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data: boolean) => void;
}

export const useUnitStore = create<States>()((set, get) => ({
  data: null,
  setData: (data: UnitOfMeasure) => {
    console.log(data, "data");
    set({ data: data });
  },
  getData: () => get().data,
  clearData: () => set({ data: null }),
  isEdit: false,
  setIsEdit: (data: boolean) => {
    set({ isEdit: data });
  },
}));
