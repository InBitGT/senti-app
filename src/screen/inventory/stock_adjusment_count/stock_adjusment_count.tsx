import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalStockAdjustmentDetail } from "@/components/molecules/ModalStockAdjusmentCount/ModalStockAdjusmentCount";
import { StockAdjustmentsTable } from "@/components/templates/StockAdjustmentCount/StockAdjustmentCount";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useStockCounAdjustment } from "@/src/hooks/useStockCountAdjustment/useStockCountAdjustment";
import { useAuthStore } from "@/src/store";
import {
  ApprovedType,
  StatusAdjustmentStock,
  StatusAdjustmentStockSelect,
  StockAdjustmentCount as StockAdjustmentModel,
} from "@/src/types/stock_adjustment/stock_adjustment.types";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { View } from "react-native";

interface WarehouseOption {
  id: number;
  label: string;
}

// "approve" y "reject" comparten la MISMA mutation (approve.mutateAsync con distinto status),
// así que approve.isPending es true para ambos. Usamos esto para saber cuál acción
// disparó la mutation actualmente en curso y así no marcar el botón equivocado.
type PendingAction = "approve" | "reject" | null;

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
  const [selectedStatus, setSelectedStatus] =
    useState<StatusAdjustmentStockSelect>(StatusAdjustmentStockSelect.PENDING);

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
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const {
    data: adjustments,
    isLoading,
    approve,
  } = useStockCounAdjustment(selectedWarehouseId, selectedStatus);
  const { showToast } = useCustomToast();

  const handleRowPress = (data: StockAdjustmentModel) => {
    setShowModalData(true);
    setModalData(data);
  };

  const handleApprove = async (row: StockAdjustmentModel) => {
    if (!claims) return;
    setPendingAction("approve");
    try {
      const payload: ApprovedType = {
        approved_by: claims.sub,
        notes: "",
      };

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
    } finally {
      setPendingAction(null);
    }
  };

  const handleReject = async (row: StockAdjustmentModel) => {
    if (!claims) return;
    setPendingAction("reject");
    try {
      const payload: ApprovedType = {
        approved_by: claims.sub,
      } as ApprovedType;

      await approve.mutateAsync({
        adjusmentCountId: row.id,
        data: payload,
        status: StatusAdjustmentStock.REJECTED,
      });
      showToast({ message: "Ajuste rechazado correctamente", type: "success" });
      setShowModalData(false);
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al rechazar el ajuste", type: "error" });
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <WarehouseSelect
          options={warehouseOptions}
          selectedValue={selectedWarehouseId}
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
        onReject={handleReject}
        isApproving={approve.isPending && pendingAction === "approve"}
        isRejecting={approve.isPending && pendingAction === "reject"}
      />
    </View>
  );
};

interface WarehouseSelectProps {
  options: WarehouseOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const WarehouseSelect: React.FC<WarehouseSelectProps> = ({
  options,
  selectedValue,
  onValueChange,
}) => {
  if (options.length <= 1) return null; // no tiene sentido filtrar si solo hay una bodega

  return (
    <VStack className="px-4 pt-6 md:px-10">
      <HStack className="items-center gap-2">
        <View style={{ width: 260 }}>
          <AppSelect
            placeholder="Selecciona una bodega"
            searchable={options.length > 6}
            options={options.map((w) => ({
              label: w.label,
              value: String(w.id),
            }))}
            value={selectedValue}
            onChange={onValueChange}
          />
        </View>
      </HStack>
    </VStack>
  );
};
