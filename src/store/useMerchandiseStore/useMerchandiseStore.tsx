import { MerchandiseListItem } from "@/src/types/merchandise/merchandise.types";
import { create } from "zustand";

interface States {
  data: MerchandiseListItem | null;
  setData: (data: MerchandiseListItem) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data: boolean) => void;
}

export const useMerchandiseStore = create<States>()((set, get) => ({
  data: null,
  setData: (data: MerchandiseListItem) => {
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
