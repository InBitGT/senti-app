import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { usePrinterConnection } from "@/src/hooks/usePrinterConnection/usePrinterConnection";
import { usePrinterSetup } from "@/src/hooks/usePrinterSetup/usePrinterSetup";
import { isPrinterSupported } from "@/src/service/printer/printer";
import {
  PrintMode,
  usePrinterStore,
} from "@/src/store/usePrinterStore/usePrinterStore";
import {
  AlertTriangle,
  CheckCircle2,
  Hand,
  HelpCircle,
  Plug,
  Printer,
  RefreshCw,
  Save,
  Trash2,
  Zap,
} from "lucide-react-native";
import { ActivityIndicator, Pressable } from "react-native";

const PRINT_MODES: {
  value: PrintMode;
  title: string;
  detail: string;
  Icon: typeof Zap;
}[] = [
  {
    value: "auto",
    title: "Al hacer una venta",
    detail:
      "Imprime el ticket de cocina automáticamente. Muestra “Reimprimir orden”.",
    Icon: Zap,
  },
  {
    value: "on_demand",
    title: "Solo bajo pedido",
    detail: "No imprime solo. Muestra el botón “Imprimir orden” en el pago.",
    Icon: Hand,
  },
];

function PrintModeSelector() {
  const printMode = usePrinterStore((s) => s.printMode);
  const setPrintMode = usePrinterStore((s) => s.setPrintMode);

  return (
    <VStack className="gap-2">
      <Text
        size="xs"
        className="font-semibold uppercase tracking-wider text-gray-400"
      >
        Modo de impresión
      </Text>
      <HStack className="flex-wrap gap-3">
        {PRINT_MODES.map(({ value, title, detail, Icon }) => {
          const active = printMode === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => setPrintMode(value)}
              style={{
                flexGrow: 1,
                flexBasis: 200,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: active ? "#6366f1" : "#e5e7eb",
                backgroundColor: active ? "#eef2ff" : "#f9fafb",
                padding: 14,
                gap: 6,
              }}
            >
              <HStack className="items-center gap-2">
                <Icon size={18} color={active ? "#6366f1" : "#6b7280"} />
                <Text
                  className="font-semibold"
                  style={{ color: active ? "#4338ca" : "#374151" }}
                >
                  {title}
                </Text>
              </HStack>
              <Text size="xs" className="text-gray-500">
                {detail}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </VStack>
  );
}

const STATUS_UI = {
  connected: { label: "Conectada", color: "#16a34a", Icon: CheckCircle2 },
  error: { label: "Sin conexión", color: "#dc2626", Icon: AlertTriangle },
  checking: { label: "Verificando...", color: "#6b7280", Icon: HelpCircle },
  unknown: { label: "Sin verificar", color: "#6b7280", Icon: HelpCircle },
} as const;

export function PrinterSection() {
  const supported = isPrinterSupported();
  const {
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
  } = usePrinterSetup(supported);
  // La sección hace su propia verificación al entrar.
  const connection = usePrinterConnection();
  const statusUi = STATUS_UI[connection.status];

  return (
    <Card className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <VStack>
        <HStack className="items-center gap-2">
          <Printer size={20} color="#6366f1" />
          <Heading size="lg" className="text-gray-900">
            Impresora térmica
          </Heading>
        </HStack>
        <Text size="sm" className="text-gray-500">
          Elige la impresora Bluetooth de confianza para los tickets de cocina.
          Se guarda en este dispositivo.
        </Text>
      </VStack>

      {!supported ? (
        <Box className="mt-5 rounded-lg bg-gray-50 p-4">
          <Text size="sm" className="text-gray-600">
            La impresión térmica solo está disponible en la app de Android.
          </Text>
        </Box>
      ) : (
        <VStack className="mt-5 gap-5">
          <Box className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wider text-gray-400"
            >
              Impresora de confianza
            </Text>
            {printer ? (
              <VStack className="mt-2 gap-3">
                <HStack className="items-center gap-2">
                  {connection.isChecking ? (
                    <ActivityIndicator size="small" color={statusUi.color} />
                  ) : (
                    <statusUi.Icon size={18} color={statusUi.color} />
                  )}
                  <VStack className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {printer.name || "Sin nombre"}
                    </Text>
                    <Text size="xs" className="text-gray-500">
                      {printer.address}
                    </Text>
                  </VStack>
                  <Text
                    size="xs"
                    className="font-semibold"
                    style={{ color: statusUi.color }}
                  >
                    {statusUi.label}
                  </Text>
                </HStack>
                {connection.status === "error" && !!connection.error && (
                  <Text size="xs" className="text-red-700">
                    {connection.error}
                  </Text>
                )}
                <AppButton
                  label={
                    connection.isChecking
                      ? "Verificando..."
                      : "Verificar conexión"
                  }
                  variant="black"
                  outline
                  outlineBorderColor="#D1D5DB"
                  outlineTextColor="#374151"
                  icon={Plug}
                  isDisabled={connection.isChecking || isBusy}
                  onPress={connection.check}
                />
              </VStack>
            ) : (
              <Text size="sm" className="mt-2 text-gray-500">
                Aún no hay una impresora guardada.
              </Text>
            )}
          </Box>

          <PrintModeSelector />

          <VStack className="gap-2">
            <AppSelect
              label="Impresora emparejada"
              placeholder={
                isLoading
                  ? "Buscando impresoras..."
                  : "Selecciona una impresora"
              }
              searchable={false}
              options={devices.map((d) => ({
                label: `${d.name || "Sin nombre"} · ${d.address}`,
                value: d.address,
              }))}
              value={selected}
              onChange={select}
            />
            <Text size="xs" className="text-gray-400">
              Si no aparece, emparéjala primero en los ajustes de Bluetooth de
              Android y presiona “Actualizar”.
            </Text>
            {!!message && (
              <Text size="sm" className="font-medium text-gray-700">
                {message}
              </Text>
            )}
          </VStack>

          <HStack className="flex-wrap gap-2">
            <Box className="min-w-[140px] flex-1">
              <AppButton
                label="Actualizar"
                variant="black"
                outline
                outlineBorderColor="#D1D5DB"
                outlineTextColor="#374151"
                icon={RefreshCw}
                isLoading={isLoading}
                isDisabled={isBusy || isLoading}
                onPress={refresh}
              />
            </Box>
            <Box className="min-w-[140px] flex-1">
              <AppButton
                label="Imprimir prueba"
                variant="black"
                outline
                outlineBorderColor="#D1D5DB"
                outlineTextColor="#374151"
                icon={Printer}
                isLoading={isBusy}
                isDisabled={isBusy || !selectedDevice}
                onPress={test}
              />
            </Box>
            <Box className="min-w-[140px] flex-1">
              <AppButton
                label="Guardar"
                variant="info"
                icon={Save}
                isDisabled={
                  isBusy || !selectedDevice || selected === printer?.address
                }
                onPress={save}
              />
            </Box>
          </HStack>

          {!!printer && (
            <AppButton
              label="Olvidar impresora"
              variant="black"
              outline
              outlineBorderColor="#FECACA"
              outlineTextColor="#DC2626"
              icon={Trash2}
              isDisabled={isBusy}
              onPress={forget}
            />
          )}
        </VStack>
      )}
    </Card>
  );
}
