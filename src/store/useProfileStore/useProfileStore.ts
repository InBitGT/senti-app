import { UserInfo } from '@/src/types';
import { create } from 'zustand';

interface States {
  user: UserInfo | null;
  setUser: (data: UserInfo) => void;
  clearUser: () => void;
}


export const useProfileStore = create<States>()(
    (set, get) => ({
      user: null,
      setUser: (data: UserInfo) => {
        set({ user: data });
      },
       getUser: () => get().user,
      clearUser: () => set({ user: null }),
    }),
);