import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalInventoryStockDetail } from "@/components/molecules/ModalInventory/ModalInventory";
import { InventoryStockTable } from "@/components/templates/InventoryStockTable/InventoryStockTable";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useInventory } from "@/src/hooks/useInventory/useInventory";
import { useAuthStore } from "@/src/store";
import { InventoryStockItem } from "@/src/types/inventory/inventory";
import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

export const InventoryStockScreen: React.FC = () => {
  const { claims } = useAuthStore();

  const branchOptions = useMemo(
    () =>
      (claims?.branches ?? []).map((b) => ({
        id: b.branch_id,
        name: b.branch_name,
        warehouses: b.warehouses,
      })),
    [claims],
  );

  const totalWarehouses = useMemo(
    () => branchOptions.reduce((acc, b) => acc + b.warehouses.length, 0),
    [branchOptions],
  );

  const hideBranchWarehouseSelects =
    branchOptions.length === 1 && totalWarehouses === 1;

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    hideBranchWarehouseSelects ? String(branchOptions[0]?.id ?? "") : "",
  );

  React.useEffect(() => {
    if (!selectedBranchId && branchOptions.length > 0) {
      setSelectedBranchId(String(branchOptions[0].id));
    }
  }, [branchOptions, selectedBranchId]);

  const selectedBranch = branchOptions.find(
    (b) => String(b.id) === selectedBranchId,
  );
  const warehouseOptionsForBranch = selectedBranch?.warehouses ?? [];

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelectedWarehouseId("");
  }, [selectedBranchId]);

  React.useEffect(() => {
    if (!selectedWarehouseId && warehouseOptionsForBranch.length === 1) {
      setSelectedWarehouseId(String(warehouseOptionsForBranch[0].warehouse_id));
    }
  }, [warehouseOptionsForBranch, selectedWarehouseId]);

  const branchSelectOptions = useMemo(
    () =>
      branchOptions.map((b) => ({
        label: b.name,
        value: String(b.id),
      })),
    [branchOptions],
  );

  const warehouseSelectOptions = useMemo(
    () =>
      warehouseOptionsForBranch.map((w) => ({
        label: w.warehouse_name,
        value: String(w.warehouse_id),
      })),
    [warehouseOptionsForBranch],
  );

  const { data: stock, isLoading } = useInventory(selectedWarehouseId);

  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setModalData] = useState<InventoryStockItem | undefined>(
    undefined,
  );

  const handleRowPress = (data: InventoryStockItem) => {
    setShowModalData(true);
    setModalData(data);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <DesktopScrollView>
        {!hideBranchWarehouseSelects && (
          <VStack className="px-4 pt-6 md:px-10 gap-2">
            <HStack className="items-center gap-2">
              {/* Sucursal — solo si el usuario tiene acceso a más de una */}
              {branchOptions.length > 1 && (
                <View style={{ width: 220 }}>
                  <AppSelect
                    placeholder="Selecciona una sucursal"
                    searchable={branchSelectOptions.length > 6}
                    options={branchSelectOptions}
                    value={selectedBranchId}
                    onChange={setSelectedBranchId}
                  />
                </View>
              )}

              {/* Bodega — solo si la sucursal seleccionada tiene más de una */}
              {warehouseOptionsForBranch.length > 1 && (
                <View style={{ width: 220 }}>
                  <AppSelect
                    placeholder="Selecciona una bodega"
                    searchable={warehouseSelectOptions.length > 6}
                    options={warehouseSelectOptions}
                    value={selectedWarehouseId}
                    onChange={setSelectedWarehouseId}
                  />
                </View>
              )}
            </HStack>
          </VStack>
        )}

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <InventoryStockTable
            data={stock || []}
            itemsPerPage={8}
            onRowPress={handleRowPress}
          />
        )}

        <ModalInventoryStockDetail
          isOpen={showModalData}
          onClose={() => setShowModalData(false)}
          data={modalData}
        />
      </DesktopScrollView>
    </ScrollView>
  );
};
