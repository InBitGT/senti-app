import { MenuItem } from '@/src/types/menuItem/menuItem.types';
import { create } from 'zustand';

interface States {
  data: MenuItem | null;
  setData: (data: MenuItem) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data:boolean)=>void
}


export const useOrderStore = create<States>()(
    (set, get) => ({
      data: null,
      setData: (data: MenuItem) => {
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