import { CatalogProduct, SellUnit } from "@/src/types/pos/pos";
import { create } from "zustand";

export interface CartLine {
  product: CatalogProduct;
  unit: SellUnit;
  // `quantity` está SIEMPRE en unidades base (las mismas de stock_qty),
  // nunca en "cantidad de la unidad de venta elegida". Elegir "Caja" no
  // cambia lo que significa `quantity`, cambia de cuánto en cuánto salta
  // cada +/- (el factor de esa unidad).
  quantity: number;
}

interface CartState {
  cart: CartLine[];
  addLine: (product: CatalogProduct, unit: SellUnit) => void;
  stepLine: (index: number, direction: 1 | -1) => void;
  setLineQty: (index: number, raw: string) => void;
  removeLine: (index: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],

  // Añadir 1 "Caja" (factorToBase 10) suma 10 a la cantidad, no 1.
  addLine: (product, unit) =>
    set((state) => {
      const existing = state.cart.find(
        (l) =>
          l.product.product_id === product.product_id &&
          l.unit.uom_id === unit.uom_id,
      );
      if (existing) {
        return {
          cart: state.cart.map((l) =>
            l === existing
              ? { ...l, quantity: l.quantity + unit.factorToBase }
              : l,
          ),
        };
      }
      return {
        cart: [...state.cart, { product, unit, quantity: unit.factorToBase }],
      };
    }),

  // Cada tap suma/resta el factor de la unidad de ESA línea: +1/-1 si es
  // "unidad" (factor 1), +10/-10 si es "Caja" (factor 10), etc.
  stepLine: (index, direction) =>
    set((state) => {
      const line = state.cart[index];
      if (!line) return state;
      const step = line.unit.factorToBase * direction;
      const next = line.quantity + step;
      if (next <= 0) return { cart: state.cart.filter((_, i) => i !== index) };
      return {
        cart: state.cart.map((l, i) =>
          i === index ? { ...l, quantity: next } : l,
        ),
      };
    }),

  // Edición manual: la persona escribe directamente en unidades base.
  // No elimina la línea automáticamente al llegar a 0/vacío.
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
