import { requireOptionalNativeModule } from "expo";
import { PermissionsAndroid, Platform } from "react-native";

export interface PairedPrinter {
  name: string;
  address: string;
}

interface SentiPrinterNative {
  getPairedDevices(): Promise<PairedPrinter[]>;
  print(address: string, base64: string): Promise<void>;
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

export async function PrintBytesFn(
  address: string,
  bytes: Uint8Array,
): Promise<void> {
  if (!native) throw new Error("Impresión disponible solo en Android.");
  await ensurePermission();
  try {
    await native.print(address, toBase64(bytes));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (/apagado/i.test(message)) throw new Error("El Bluetooth está apagado.");
    throw new Error("No se pudo conectar con la impresora");
  }
}
