import { Category } from "@/src/types";
import { create } from "zustand";

interface States {
  data: Category | null;
  setData: (data: Category) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data: boolean) => void;
}

export const useCategorieStore = create<States>()((set, get) => ({
  data: null,
  setData: (data: Category) => {
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
