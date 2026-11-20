import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { usePrinterSetup } from "@/src/hooks/usePrinterSetup/usePrinterSetup";
import { isPrinterSupported } from "@/src/service/printer/printer";
import {
  CheckCircle2,
  Printer,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react-native";

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
              <HStack className="mt-2 items-center gap-2">
                <CheckCircle2 size={18} color="#16a34a" />
                <VStack className="flex-1">
                  <Text className="font-medium text-gray-900">
                    {printer.name || "Sin nombre"}
                  </Text>
                  <Text size="xs" className="text-gray-500">
                    {printer.address}
                  </Text>
                </VStack>
              </HStack>
            ) : (
              <Text size="sm" className="mt-2 text-gray-500">
                Aún no hay una impresora guardada.
              </Text>
            )}
          </Box>

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
