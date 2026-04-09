import { CategoryDetail } from '@/src/types';
import { create } from 'zustand';

interface States {
  data: CategoryDetail | null;
  setData: (data: CategoryDetail) => void;
  clearData: () => void;
  isEdit: boolean;
  setIsEdit: (data:boolean)=>void
}


export const useCategorieStore = create<States>()(
    (set, get) => ({
      data: null,
      setData: (data: CategoryDetail) => {
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