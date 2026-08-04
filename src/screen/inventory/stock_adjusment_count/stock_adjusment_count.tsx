import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalStockAdjustmentDetail } from "@/components/molecules/ModalStockAdjusmentCount/ModalStockAdjusmentCount";
import { StockAdjustmentsTable } from "@/components/templates/StockAdjustmentCount/StockAdjustmentCount";
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
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useStockCounAdjustment } from "@/src/hooks/useStockCountAdjustment/useStockCountAdjustment";
import { useAuthStore } from "@/src/store";
import {
    ApprovedType,
    StatusAdjustmentStock,
    StockAdjustmentCount as StockAdjustmentModel,
} from "@/src/types/stock_adjustment/stock_adjustment.types";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { View } from "react-native";

interface WarehouseOption {
  id: number;
  label: string;
}

export const StockAdjustmentCountScreen: React.FC = () => {
  // Si la pantalla se abre con /warehouse/[id]/adjustments, este id se usa como valor inicial del select.
  const { id: routeWarehouseId } = useLocalSearchParams<{ id: string }>();
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

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    routeWarehouseId ? String(routeWarehouseId) : "",
  );
  const [selectedStatus, setSelectedStatus] = useState<StatusAdjustmentStock>(
    StatusAdjustmentStock.PENDING,
  );

  // Si aún no hay selección (ni por ruta) y ya cargaron las bodegas de claims, selecciona la primera.
  React.useEffect(() => {
    if (!selectedWarehouseId && warehouseOptions.length > 0) {
      setSelectedWarehouseId(String(warehouseOptions[0].id));
    }
  }, [warehouseOptions, selectedWarehouseId]);

  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setModalData] = useState<StockAdjustmentModel | undefined>(
    undefined,
  );
  const {
    data: adjustments,
    isLoading,
    approve,
  } = useStockCounAdjustment(selectedWarehouseId, selectedStatus);
  const { showToast } = useCustomToast();

  const selectedWarehouseLabel =
    warehouseOptions.find((w) => String(w.id) === selectedWarehouseId)?.label ||
    "";

  const handleRowPress = (data: StockAdjustmentModel) => {
    setShowModalData(true);
    setModalData(data);
  };

  const handleApprove = async (row: StockAdjustmentModel) => {
    if (!claims) return;
    try {
      const payload: ApprovedType = {
        approved_by: claims.sub,
        notes: "",
      } as ApprovedType;

      await approve.mutateAsync({
        adjusmentCountId: row.id,
        data: payload,
        status: StatusAdjustmentStock.APPROVED,
      });
      showToast({ message: "Ajuste aprobado correctamente", type: "success" });
      setShowModalData(false);
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al aprobar el ajuste", type: "error" });
    }
  };

  const handleReject = async (row: StockAdjustmentModel) => {
    if (!claims) return;
    try {
      const payload: ApprovedType = {
        approved_by: claims.sub,
      } as ApprovedType;

      await approve.mutateAsync({
        adjusmentCountId: row.id,
        data: payload,
        status: StatusAdjustmentStock.REJECTED,
      });
      showToast({ message: "Ajuste aprobado correctamente", type: "success" });
      setShowModalData(false);
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al aprobar el ajuste", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <WarehouseSelect
          options={warehouseOptions}
          selectedValue={selectedWarehouseId}
          selectedLabel={selectedWarehouseLabel}
          onValueChange={setSelectedWarehouseId}
        />
        <TableSkeleton />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WarehouseSelect
        options={warehouseOptions}
        selectedValue={selectedWarehouseId}
        selectedLabel={selectedWarehouseLabel}
        onValueChange={setSelectedWarehouseId}
      />
      <StockAdjustmentsTable
        data={adjustments || []}
        itemsPerPage={5}
        onRowPress={handleRowPress}
        statusFilter={selectedStatus}
        onStatusFilterChange={setSelectedStatus}
      />
      <ModalStockAdjustmentDetail
        isOpen={showModalData}
        onClose={() => setShowModalData(false)}
        data={modalData}
        onApprove={handleApprove}
        isApproving={approve.isPending}
        onReject={handleReject}
      />
    </View>
  );
};

interface WarehouseSelectProps {
  options: WarehouseOption[];
  selectedValue: string;
  selectedLabel: string;
  onValueChange: (value: string) => void;
}

const WarehouseSelect: React.FC<WarehouseSelectProps> = ({
  options,
  selectedValue,
  selectedLabel,
  onValueChange,
}) => {
  if (options.length <= 1) return null; // no tiene sentido filtrar si solo hay una bodega

  return (
    <VStack className="px-4 pt-6 md:px-10">
      <HStack className="items-center gap-2">
        <View style={{ width: 260 }}>
          <Select selectedValue={selectedValue} onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectInput
                style={{ color: "#000" }}
                placeholder="Selecciona una bodega"
                value={selectedLabel}
              />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {options.map((w) => (
                  <SelectItem key={w.id} label={w.label} value={String(w.id)} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>
      </HStack>
    </VStack>
  );
};
