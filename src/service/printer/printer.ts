import { requireOptionalNativeModule } from "expo";
import { usePrinterStatusStore } from "@/src/store/usePrinterStatusStore/usePrinterStatusStore";
import { PermissionsAndroid, Platform } from "react-native";

export interface PairedPrinter {
  name: string;
  address: string;
}

interface SentiPrinterNative {
  getPairedDevices(): Promise<PairedPrinter[]>;
  print(address: string, base64: string): Promise<void>;
  checkConnection(address: string): Promise<void>;
}

const native = requireOptionalNativeModule<SentiPrinterNative>("SentiPrinter");

export function isPrinterSupported(): boolean {
  return Platform.OS === "android" && native != null;
}

async function ensurePermission(): Promise<void> {
  if (Platform.OS !== "android" || Number(Platform.Version) < 31) return;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  );
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    throw new Error(
      "Permiso de Bluetooth bloqueado. Actívalo en Ajustes > Apps > Senti > Permisos > Dispositivos cercanos.",
    );
  }
  if (result !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error("Permiso de Bluetooth denegado.");
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export async function PairedPrintersFn(): Promise<PairedPrinter[]> {
  if (!native) throw new Error("Impresión disponible solo en Android.");
  await ensurePermission();
  return native.getPairedDevices();
}

function friendlyError(error: unknown): Error {
  const message = error instanceof Error ? error.message : "";
  console.warn("[printer]", message);
  if (/apagado/i.test(message)) return new Error("El Bluetooth está apagado.");
  if (/emparejada/i.test(message)) {
    return new Error("La impresora no está emparejada con este dispositivo.");
  }
  if (/permiso/i.test(message)) return error as Error;
  return new Error(
    __DEV__ && message ? message : "No se pudo conectar con la impresora.",
  );
}

/**
 * Comprueba que la impresora responde abriendo y cerrando una conexión.
 * Actualiza `usePrinterStatusStore` con el resultado.
 */
export async function CheckPrinterFn(address: string): Promise<void> {
  const status = usePrinterStatusStore.getState();
  if (!native) throw new Error("Impresión disponible solo en Android.");
  status.setChecking(address);
  try {
    await ensurePermission();
    await native.checkConnection(address);
    status.setConnected(address);
  } catch (error: unknown) {
    const friendly = friendlyError(error);
    status.setError(address, friendly.message);
    throw friendly;
  }
}

export async function PrintBytesFn(
  address: string,
  bytes: Uint8Array,
): Promise<void> {
  const status = usePrinterStatusStore.getState();
  if (!native) throw new Error("Impresión disponible solo en Android.");
  try {
    await ensurePermission();
    await native.print(address, toBase64(bytes));
    status.setConnected(address);
  } catch (error: unknown) {
    const friendly = friendlyError(error);
    status.setError(address, friendly.message);
    throw friendly;
  }
}
