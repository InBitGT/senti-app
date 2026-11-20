import {
  PairedPrinter,
  PairedPrintersFn,
  PrintBytesFn,
} from "@/src/service/printer/printer";
import { usePrinterStore } from "@/src/store/usePrinterStore/usePrinterStore";
import { EscPosBuilder } from "@/src/utils/printer/escpos";
import { useCallback, useEffect, useState } from "react";

function testTicketBytes(): Uint8Array {
  return new EscPosBuilder()
    .init()
    .align("center")
    .bold(true)
    .tall(true)
    .line("SENTI")
    .tall(false)
    .bold(false)
    .line("Prueba de impresión")
    .line("áéíóú ñÑ ¿¡")
    .separator()
    .feed(4)
    .build();
}

/**
 * Lógica compartida para elegir, probar y guardar la impresora térmica de
 * confianza. La impresora guardada vive en `usePrinterStore`, que persiste
 * en el almacenamiento local del dispositivo.
 *
 * @param active Cuando pasa a `true` se lee la lista de dispositivos
 *   emparejados (y se pide el permiso de Bluetooth si hace falta).
 */
export function usePrinterSetup(active: boolean) {
  const printer = usePrinterStore((s) => s.printer);
  const setPrinter = usePrinterStore((s) => s.setPrinter);
  const [devices, setDevices] = useState<PairedPrinter[]>([]);
  // null = el usuario no ha elegido nada; se muestra la guardada.
  const [choice, setChoice] = useState<string | null>(null);
  const selected = choice ?? printer?.address ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(active);

  // Solo hace setState dentro de callbacks asíncronos, para poder usarse
  // desde un efecto. `isCancelled` evita actualizar un componente desmontado.
  const loadDevices = useCallback(
    (isCancelled: () => boolean = () => false) => {
      return PairedPrintersFn()
        .then((list) => {
          if (!isCancelled()) setDevices(list);
        })
        .catch((e: unknown) => {
          if (isCancelled()) return;
          setMessage(
            e instanceof Error ? e.message : "No se pudo leer el Bluetooth.",
          );
        })
        .finally(() => {
          if (!isCancelled()) setIsLoading(false);
        });
    },
    [],
  );

  // Al activarse (abrir el modal / entrar a la sección) se leen los
  // dispositivos emparejados; aquí se pide el permiso de Bluetooth.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    loadDevices(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [active, loadDevices]);

  async function refresh() {
    setIsLoading(true);
    setMessage(null);
    await loadDevices();
  }

  const selectedDevice = devices.find((d) => d.address === selected) ?? null;

  function select(address: string) {
    setChoice(address);
    setMessage(null);
  }

  async function test(): Promise<boolean> {
    if (!selectedDevice) {
      setMessage("Selecciona una impresora.");
      return false;
    }
    setIsBusy(true);
    setMessage(null);
    try {
      await PrintBytesFn(selectedDevice.address, testTicketBytes());
      setMessage("Prueba enviada.");
      return true;
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "No se pudo imprimir.");
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  function save(): boolean {
    if (!selectedDevice) {
      setMessage("Selecciona una impresora.");
      return false;
    }
    setPrinter(selectedDevice);
    setChoice(null);
    setMessage("Impresora guardada como de confianza.");
    return true;
  }

  function forget() {
    setPrinter(null);
    setChoice(null);
    setMessage("Se olvidó la impresora guardada.");
  }

  return {
    printer,
    devices,
    selected,
    selectedDevice,
    message,
    isBusy,
    isLoading,
    select,
    refresh,
    test,
    save,
    forget,
  };
}
