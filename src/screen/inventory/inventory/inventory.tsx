import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalInventoryStockDetail } from "@/components/molecules/ModalInventory/ModalInventory";
import { InventoryStockTable } from "@/components/templates/InventoryStockTable/InventoryStockTable";
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
import { useInventory } from "@/src/hooks/useInventory/useInventory";
import { useAuthStore } from "@/src/store";
import { InventoryStockItem } from "@/src/types/inventory/inventory";
import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

export const InventoryStockScreen: React.FC = () => {
  const { claims } = useAuthStore();

  // Sucursales + bodegas a las que el usuario tiene acceso, según sus claims.
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

  // Si el usuario tiene exactamente 1 sucursal y 1 bodega en total, no se le
  // muestra ningún select: se usa esa única combinación automáticamente.
  const hideBranchWarehouseSelects =
    branchOptions.length === 1 && totalWarehouses === 1;

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    hideBranchWarehouseSelects ? String(branchOptions[0]?.id ?? "") : "",
  );

  // Autoselecciona la primera sucursal en cuanto cargan los claims, si aún no hay ninguna elegida.
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

  // Al cambiar de sucursal, se limpia la bodega seleccionada (pertenecía a la sucursal anterior).
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelectedWarehouseId("");
  }, [selectedBranchId]);

  // Autoselecciona la bodega si la sucursal actual solo tiene una.
  React.useEffect(() => {
    if (!selectedWarehouseId && warehouseOptionsForBranch.length === 1) {
      setSelectedWarehouseId(String(warehouseOptionsForBranch[0].warehouse_id));
    }
  }, [warehouseOptionsForBranch, selectedWarehouseId]);

  const selectedBranchLabel = selectedBranch?.name ?? "";
  const selectedWarehouseLabel =
    warehouseOptionsForBranch.find(
      (w) => String(w.warehouse_id) === selectedWarehouseId,
    )?.warehouse_name ?? "";

  const { data: stock, isLoading } = useInventory(selectedWarehouseId);

  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setModalData] = useState<InventoryStockItem | undefined>(
    undefined,
  );

  const handleRowPress = (data: InventoryStockItem) => {
    setShowModalData(true);
    setModalData(data);
  };

  console.log(stock, "stock");
  return (
    <ScrollView style={{ flex: 1 }}>
      <DesktopScrollView>
        {!hideBranchWarehouseSelects && (
          <VStack className="px-4 pt-6 md:px-10 gap-2">
            <HStack className="items-center gap-2">
              {/* Sucursal — solo si el usuario tiene acceso a más de una */}
              {branchOptions.length > 1 && (
                <View style={{ width: 220 }}>
                  <Select
                    selectedValue={selectedBranchId}
                    onValueChange={setSelectedBranchId}
                  >
                    <SelectTrigger>
                      <SelectInput
                        style={{ color: "#000" }}
                        placeholder="Selecciona una sucursal"
                        value={selectedBranchLabel}
                      />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {branchOptions.map((b) => (
                          <SelectItem
                            key={b.id}
                            label={b.name}
                            value={String(b.id)}
                          />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </View>
              )}

              {/* Bodega — solo si la sucursal seleccionada tiene más de una */}
              {warehouseOptionsForBranch.length > 1 && (
                <View style={{ width: 220 }}>
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
                        {warehouseOptionsForBranch.map((w) => (
                          <SelectItem
                            key={w.warehouse_id}
                            label={w.warehouse_name}
                            value={String(w.warehouse_id)}
                          />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
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
