import { create } from "zustand";

type RefreshFn = () => Promise<unknown> | void;

interface OpenCashModalState {
  isOpen: boolean;
  dismissed: boolean;
  onRefresh: RefreshFn | null;
  /** Abre el modal. Con force=true ignora que el usuario lo haya descartado. */
  open: (onRefresh: RefreshFn, force?: boolean) => void;
  /** El usuario lo cerró: no se reabre solo. */
  dismiss: () => void;
  /** Cierre programático (hay sesión, se perdió el foco, etc.). */
  close: () => void;
  resetDismissed: () => void;
}

export const useOpenCashModalStore = create<OpenCashModalState>((set, get) => ({
  isOpen: false,
  dismissed: false,
  onRefresh: null,
  open: (onRefresh, force = false) => {
    const { isOpen, dismissed } = get();
    if (isOpen) return;
    if (dismissed && !force) return;
    set({ isOpen: true, dismissed: false, onRefresh });
  },
  dismiss: () => set({ isOpen: false, dismissed: true, onRefresh: null }),
  close: () => {
    if (!get().isOpen) return;
    set({ isOpen: false, onRefresh: null });
  },
  resetDismissed: () => {
    if (get().dismissed) set({ dismissed: false });
  },
}));
