import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseIcon, Icon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  getAvailabilityLabel,
  Packaging,
} from "@/src/types/packaging/packaging";

export interface ModalPackagingDetailProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Packaging;
}

interface DetailRowProps {
  label: string;
  value: string;
}

const formatCurrency = (value: number): string => `Q ${value.toFixed(2)}`;

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <HStack className="justify-between py-2 border-b border-outline-100">
      <Text size="sm" className="text-typography-500">
        {label}
      </Text>
      <Text
        size="sm"
        style={{ color: "#000", flexShrink: 1, textAlign: "right" }}
      >
        {value}
      </Text>
    </HStack>
  );
}

export function ModalPackagingDetail({
  isOpen,
  onClose,
  data,
}: ModalPackagingDetailProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md" style={{ color: "#000" }}>
            {data?.name ?? "Detalle del empaque"}
          </Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          {data && (
            <VStack>
              <DetailRow label="SKU" value={data.sku} />
              <DetailRow label="Código de barras" value={data.barcode ?? "—"} />
              <DetailRow label="Marca" value={data.brand ?? "—"} />
              <DetailRow label="Categoría" value={data.category_name} />
              <DetailRow label="Descripción" value={data.description ?? "—"} />
              <DetailRow
                label="Costo promedio"
                value={formatCurrency(data.average_cost)}
              />
              <DetailRow
                label="Disponibilidad"
                value={getAvailabilityLabel(data.availability_status)}
              />
              <DetailRow
                label="Nombre del modificador"
                value={data.modifier_name}
              />
              <DetailRow
                label="Cantidad"
                value={String(data.modifier_quantity)}
              />
              <DetailRow
                label="Selección mín. / máx."
                value={`${data.modifier_min_selection} / ${data.modifier_max_selection}`}
              />
              <DetailRow
                label="Ajuste de precio"
                value={formatCurrency(data.modifier_price_adjustment)}
              />
              <DetailRow
                label="Por defecto"
                value={data.modifier_is_default ? "Sí" : "No"}
              />
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onPress={onClose}>
            <ButtonText>Cerrar</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
