import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { VStack } from "@/components/ui/vstack";
import {
  PairedPrinter,
  PairedPrintersFn,
  PrintBytesFn,
} from "@/src/service/printer/printer";
import { usePrinterStore } from "@/src/store/usePrinterStore/usePrinterStore";
import { EscPosBuilder } from "@/src/utils/printer/escpos";
import { Printer, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";

export function PrinterSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const printer = usePrinterStore((s) => s.printer);
  const setPrinter = usePrinterStore((s) => s.setPrinter);
  const [devices, setDevices] = useState<PairedPrinter[]>([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(printer?.address ?? "");
    setMessage(null);
    PairedPrintersFn()
      .then(setDevices)
      .catch((e: unknown) =>
        setMessage(
          e instanceof Error ? e.message : "No se pudo leer el Bluetooth.",
        ),
      );
  }, [isOpen, printer]);

  const selectedDevice = devices.find((d) => d.address === selected) ?? null;

  async function handleTest() {
    if (!selectedDevice) {
      setMessage("Selecciona una impresora.");
      return;
    }
    setIsBusy(true);
    setMessage(null);
    try {
      const bytes = new EscPosBuilder()
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
      await PrintBytesFn(selectedDevice.address, bytes);
      setMessage("Prueba enviada.");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "No se pudo imprimir.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleSave() {
    setPrinter(selectedDevice);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="bg-white">
        <ModalHeader className="items-center justify-between">
          <Heading size="md" className="text-gray-900">
            Impresora
          </Heading>
          <TouchableOpacity onPress={onClose}>
            <Icon as={X} size="xl" className="text-gray-400 p-4" />
          </TouchableOpacity>
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <AppSelect
              label="Impresora emparejada"
              placeholder="Selecciona una impresora"
              searchable={false}
              options={devices.map((d) => ({
                label: `${d.name || "Sin nombre"} · ${d.address}`,
                value: d.address,
              }))}
              value={selected}
              onChange={(value) => {
                setSelected(value);
                setMessage(null);
              }}
            />
            <Text className="text-xs text-gray-400">
              Si no aparece, emparéjala primero en los ajustes de Bluetooth de
              Android.
            </Text>
            {!!message && (
              <Text className="text-xs font-medium text-gray-700">
                {message}
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack space="sm" className="flex-1">
            <Box className="flex-1">
              <AppButton
                label="Prueba"
                variant="black"
                outline
                outlineBorderColor="#D1D5DB"
                outlineTextColor="#374151"
                icon={Printer}
                isDisabled={isBusy || !selectedDevice}
                onPress={handleTest}
              />
            </Box>
            <Box className="flex-1">
              <AppButton
                label="Guardar"
                variant="info"
                isDisabled={isBusy || !selectedDevice}
                onPress={handleSave}
              />
            </Box>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
