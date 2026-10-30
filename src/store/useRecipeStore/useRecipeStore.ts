import { Recipe } from "@/src/types/recipe/recipe";
import { create } from "zustand";

interface RecipeStoreState {
  data?: Recipe;
  isEdit: boolean;
  setData: (data?: Recipe) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useRecipeStore = create<RecipeStoreState>((set) => ({
  data: undefined,
  isEdit: false,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
