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
import { usePrinterSetup } from "@/src/hooks/usePrinterSetup/usePrinterSetup";
import { Printer, X } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";

export function PrinterSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    devices,
    selected,
    selectedDevice,
    message,
    isBusy,
    select,
    test,
    save,
  } = usePrinterSetup(isOpen);

  function handleSave() {
    if (save()) onClose();
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
              onChange={select}
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
                onPress={test}
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
