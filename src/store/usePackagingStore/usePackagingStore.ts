import { Packaging } from "@/src/types/packaging/packaging";
import { create } from "zustand";

interface PackagingStoreState {
  data?: Packaging;
  isEdit: boolean;
  setData: (data?: Packaging) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const usePackagingStore = create<PackagingStoreState>((set) => ({
  data: undefined,
  isEdit: false,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
