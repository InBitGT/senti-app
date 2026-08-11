import { CashVoucher } from "@/src/types/cash_register/cash_register";
import { create } from "zustand";

interface CashVoucherState {
  data?: CashVoucher;
  isEdit: boolean;
  setData: (data?: CashVoucher) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useCashVoucherStore = create<CashVoucherState>((set) => ({
  data: undefined,
  isEdit: false,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
