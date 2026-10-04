import { Ingredient } from "@/src/types/ingredient/ingredient";
import { create } from "zustand";

interface IngredientStoreState {
  data?: Ingredient;
  isEdit: boolean;
  setData: (data?: Ingredient) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useIngredientStore = create<IngredientStoreState>((set) => ({
  data: undefined,
  isEdit: false,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
