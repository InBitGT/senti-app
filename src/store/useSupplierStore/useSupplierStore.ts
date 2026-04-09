import { SupplierDetail } from '@/src/types/supplier/supplier.types';
import { create } from 'zustand';

interface States {
  data: SupplierDetail | null;
  setData: (data: SupplierDetail) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data:boolean)=>void
}


export const useSupplierStore = create<States>()(
    (set, get) => ({
      data: null,
      setData: (data: SupplierDetail) => {
        console.log(data, "data")
        set({ data: data });
      },
       getData: () => get().data,
      clearData: () => set({ data: null }),
      isEdit:false,
      setIsEdit:(data: boolean)=>{
        set({isEdit:data})
      }
    }),
);