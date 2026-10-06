import {
  ApiRecipeCatalogProduct,
  RecipeCatalogModifier,
  RecipeCatalogVariant,
} from "@/src/types/recipe_pos/recipe_pos";
import { create } from "zustand";

export interface RecipeCartLine {
  product: ApiRecipeCatalogProduct;
  variant: RecipeCatalogVariant | null;
  modifiers: RecipeCatalogModifier[];
  notes: string;
  quantity: number;
}

function modifierKey(modifiers: RecipeCatalogModifier[]): string {
  return modifiers
    .map((modifier) => modifier.product_modifier_id)
    .sort((a, b) => a - b)
    .join(",");
}

function isSameLine(a: RecipeCartLine, b: RecipeCartLine): boolean {
  return (
    a.product.product_id === b.product.product_id &&
    (a.variant?.id ?? null) === (b.variant?.id ?? null) &&
    modifierKey(a.modifiers) === modifierKey(b.modifiers) &&
    a.notes.trim() === b.notes.trim()
  );
}

interface RecipeCartState {
  cart: RecipeCartLine[];
  addLine: (line: RecipeCartLine) => void;
  stepLine: (index: number, direction: 1 | -1) => void;
  setLineQty: (index: number, raw: string) => void;
  removeLine: (index: number) => void;
  clearCart: () => void;
}

export const useRecipeCartStore = create<RecipeCartState>((set) => ({
  cart: [],

  addLine: (line) =>
    set((state) => {
      const existing = state.cart.find((l) => isSameLine(l, line));
      if (existing) {
        return {
          cart: state.cart.map((l) =>
            l === existing ? { ...l, quantity: l.quantity + line.quantity } : l,
          ),
        };
      }
      return { cart: [...state.cart, line] };
    }),

  stepLine: (index, direction) =>
    set((state) => {
      const line = state.cart[index];
      if (!line) return state;
      const next = line.quantity + direction;
      if (next <= 0) return { cart: state.cart.filter((_, i) => i !== index) };
      return {
        cart: state.cart.map((l, i) =>
          i === index ? { ...l, quantity: next } : l,
        ),
      };
    }),

  setLineQty: (index, raw) =>
    set((state) => {
      const digitsOnly = raw.replace(/[^0-9]/g, "");
      const parsed = digitsOnly === "" ? 0 : Number.parseInt(digitsOnly, 10);
      return {
        cart: state.cart.map((l, i) =>
          i === index ? { ...l, quantity: parsed } : l,
        ),
      };
    }),

  removeLine: (index) =>
    set((state) => ({ cart: state.cart.filter((_, i) => i !== index) })),

  clearCart: () => set({ cart: [] }),
}));
