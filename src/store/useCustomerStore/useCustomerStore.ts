import { Customer } from "@/src/types/customer/customer";
import { create } from "zustand";

interface CustomerStoreState {
  data?: Customer;
  isEdit: boolean;
  setData: (data?: Customer) => void;
  setIsEdit: (isEdit: boolean) => void;
  clearData: () => void;
}

export const useCustomerStore = create<CustomerStoreState>((set) => ({
  data: undefined,
  isEdit: false,
  setData: (data) => set({ data }),
  setIsEdit: (isEdit) => set({ isEdit }),
  clearData: () => set({ data: undefined, isEdit: false }),
}));
