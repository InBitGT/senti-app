import { MenuIngredient } from '@/src/types/product/product.types';
import { create } from 'zustand';

interface States {
  data: MenuIngredient | null;
  setData: (data: MenuIngredient) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data:boolean)=>void
}


export const useProductStore = create<States>()(
    (set, get) => ({
      data: null,
      setData: (data: MenuIngredient) => {
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