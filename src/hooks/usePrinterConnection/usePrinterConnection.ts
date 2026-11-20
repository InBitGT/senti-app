import {
  CheckPrinterFn,
  isPrinterSupported,
} from "@/src/service/printer/printer";
import { usePrinterStatusStore } from "@/src/store/usePrinterStatusStore/usePrinterStatusStore";
import { usePrinterStore } from "@/src/store/usePrinterStore/usePrinterStore";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

/**
 * Verifica que la impresora de confianza esté conectada:
 * - al montar (y cuando cambia la impresora guardada),
 * - cada vez que la app vuelve a primer plano,
 * - y bajo demanda con `check()`.
 *
 * Las impresiones también actualizan el estado (ver `PrintBytesFn`).
 */
export function usePrinterConnection({ auto = true } = {}) {
  const supported = isPrinterSupported();
  const printer = usePrinterStore((s) => s.printer);
  const [hydrated, setHydrated] = useState(() =>
    usePrinterStore.persist.hasHydrated(),
  );
  const status = usePrinterStatusStore((s) =>
    s.address === printer?.address ? s.status : "unknown",
  );
  const error = usePrinterStatusStore((s) =>
    s.address === printer?.address ? s.error : null,
  );

  useEffect(
    () => usePrinterStore.persist.onFinishHydration(() => setHydrated(true)),
    [],
  );

  const address = printer?.address;

  const check = useCallback(async (): Promise<boolean> => {
    if (!supported || !address) return false;
    if (usePrinterStatusStore.getState().status === "checking") return false;
    try {
      await CheckPrinterFn(address);
      return true;
    } catch {
      return false;
    }
  }, [supported, address]);

  useEffect(() => {
    if (!auto || !address) return;
    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => sub.remove();
  }, [auto, address, check]);

  return {
    supported,
    hydrated,
    printer,
    status,
    error,
    isChecking: status === "checking",
    check,
  };
}
