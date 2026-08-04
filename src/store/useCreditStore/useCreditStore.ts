import { CustomerCredit } from "@/src/types/credit/credit";
import { create } from "zustand";

interface CustomerCreditStoreState {
  data?: CustomerCredit;
  isEdit: boolean;
  setData: (data?: CustomerCredit) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useCustomerCreditStore = create<CustomerCreditStoreState>(
  (set) => ({
    data: undefined,
    isEdit: false,
    setData: (data) => set({ data }),
    setIsEdit: (isEdit) => set({ isEdit }),
    clearData: () => set({ data: undefined, isEdit: false }),
  }),
);
