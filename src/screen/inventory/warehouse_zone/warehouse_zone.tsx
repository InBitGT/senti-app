import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalWarehouseZoneDetail } from "@/components/molecules/ModalWarehouseZone/ModalWarehouseZone";
import { WarehouseZonesTable } from "@/components/templates/WarehouseZoneTable/WarehouseZoneTable";
import { HStack } from "@/components/ui/hstack";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/components/ui/select";
import { VStack } from "@/components/ui/vstack";
import { useWarehouseZone } from "@/src/hooks/useWarehouseZone/useWarehouseZone";
import { useAuthStore } from "@/src/store";
import { useWarehouseZoneStore } from "@/src/store/useWahouseZoneStore/useWahouseZoneStore";
import { WarehouseZone as WarehouseZoneModel } from "@/src/types/warehouse_zone/warehouse_zone";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { View } from "react-native";

interface WarehouseOption {
  id: number;
  label: string;
}

export const WarehouseZoneScreen: React.FC = () => {
  const { claims } = useAuthStore();

  const warehouseOptions: WarehouseOption[] = useMemo(() => {
    if (!claims?.branches) return [];
    return claims.branches.flatMap((branch) =>
      branch.warehouses.map((w) => ({
        id: w.warehouse_id,
        label: `${branch.branch_name} - ${w.warehouse_name}`,
      })),
    );
  }, [claims]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  React.useEffect(() => {
    if (!selectedWarehouseId && warehouseOptions.length > 0) {
      setSelectedWarehouseId(String(warehouseOptions[0].id));
    }
  }, [warehouseOptions, selectedWarehouseId]);

  const selectedWarehouseLabel =
    warehouseOptions.find((w) => String(w.id) === selectedWarehouseId)?.label ||
    "";

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<WarehouseZoneModel | undefined>(
    undefined,
  );
  const [modal, setmodal] = useState<WarehouseZoneModel | undefined>(undefined);
  const {
    data: zones,
    isLoading,
    remove,
  } = useWarehouseZone(selectedWarehouseId);
  const { setData, setIsEdit, setWarehouseId } =
    useWarehouseZoneStore.getState();

  const hadleModalData = (data: WarehouseZoneModel) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: WarehouseZoneModel) => {
    setIsEdit(true);
    setData(data);
    setWarehouseId(selectedWarehouseId);
    router.navigate("/(drawer)/(inventory)/(form)/warehouse_zone_form");
  };

  const hadleModal = (data: WarehouseZoneModel) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<WarehouseZoneModel>[] = [
    {
      icon: "pencil",
      label: "Editar",
      onPress: (row) => handleEdit(row),
    },
    {
      icon: "delete",
      label: "Eliminar",
      onPress: (row) => hadleModal(row),
    },
  ];

  const handleCreate = () => {
    setIsEdit(false);
    setData(undefined);
    setWarehouseId(selectedWarehouseId);
    router.navigate("/(drawer)/(inventory)/(form)/warehouse_zone_form");
  };

  return (
    <View style={{ flex: 1 }}>
      {warehouseOptions.length > 1 && (
        <VStack className="px-4 pt-6 md:px-10">
          <HStack className="items-center gap-2">
            <View style={{ width: 260 }}>
              <Select
                selectedValue={selectedWarehouseId}
                onValueChange={setSelectedWarehouseId}
              >
                <SelectTrigger>
                  <SelectInput
                    style={{ color: "#000" }}
                    placeholder="Selecciona una bodega"
                    value={selectedWarehouseLabel}
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {warehouseOptions.map((w) => (
                      <SelectItem
                        key={w.id}
                        label={w.label}
                        value={String(w.id)}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>
          </HStack>
        </VStack>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <WarehouseZonesTable
          data={zones || []}
          itemsPerPage={5}
          onNewZone={handleCreate}
          onRowPress={hadleModalData}
          actions={actions}
        />
      )}

      <ModalWarehouseZoneDetail
        isOpen={showModalData}
        onClose={() => setShowModalData(false)}
        data={modalData}
      />
      <ModalDelete
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleDelete}
      />
    </View>
  );
};
