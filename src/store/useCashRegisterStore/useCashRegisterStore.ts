import { CashRegister } from "@/src/types/cash_register/cash_register";
import { create } from "zustand";

interface CashRegisterStoreState {
  data?: CashRegister;
  isEdit: boolean;
  setData: (data?: CashRegister) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useCashRegisterStore = create<CashRegisterStoreState>((set) => ({
  data: undefined,
  isEdit: false,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
