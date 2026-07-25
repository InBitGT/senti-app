import { ColumnDef, CustomTable } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalInventoryStockDetail } from "@/components/molecules/ModalInventoryStock/ModalInventoryStock";
import { Text } from "@/components/ui/text";
import { useInventoryStock } from "@/src/hooks/useInventoryStock/useInventoryStock";
import { InventoryStockDetail } from "@/src/types/inventory_stock/inventory_stock.types";
import React, { useState } from "react";
import { View } from "react-native";

const MOVEMENT_LABELS: Record<string, string> = {
  entry: "Entrada",
  sale_output: "Salida venta",
  recipe_consumption: "Consumo receta",
  adjustment_in: "Ajuste entrada",
  adjustment_out: "Ajuste salida",
};

export const InventoryStock: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modal, setmodal] = useState<InventoryStockDetail | undefined>(
    undefined,
  );
  const { data: stockData, isLoading } = useInventoryStock();
  const hadleModal = (data: InventoryStockDetail) => {
    setShowModal(true);
    setmodal(data);
  };

  const columns: ColumnDef<InventoryStockDetail>[] = [
    {
      key: "product",
      title: "Producto",
      render: (row) => (
        <View>
          <Text
            style={{ fontSize: 13, fontWeight: "500", color: "#1a1a1a" }}
            numberOfLines={1}
          >
            {row.product?.modifier_name ?? row.product?.name ?? "—"}
          </Text>
          <Text style={{ fontSize: 11, color: "#888" }} numberOfLines={1}>
            {row.product?.sku ?? "—"}
          </Text>
        </View>
      ),
    },
    {
      key: "warehouse",
      title: "Bodega",
      render: (row) => row.warehouse?.name ?? "—",
    },
    {
      key: "movement_type",
      title: "Tipo",
      render: (row) =>
        MOVEMENT_LABELS[row.movement_type] ?? row.movement_type ?? "—",
    },
    {
      key: "qty",
      title: "Cant.",
      numeric: true,
      render: (row) => String(row.qty ?? "—"),
    },
    {
      key: "unit_cost",
      title: "Costo u.",
      numeric: true,
      optional: true,
      render: (row) =>
        row.unit_cost != null ? `Q${row.unit_cost.toFixed(2)}` : "—",
    },
    {
      key: "reason",
      title: "Razón",
      optional: true,
      defaultVisible: false,
      render: (row) => row.reason ?? "—",
    },
    {
      key: "reference_number",
      title: "Referencia",
      optional: true,
      render: (row) => row.reference_number ?? "—",
    },
    {
      key: "batch",
      title: "Lote",
      optional: true,
      defaultVisible: false,
      render: (row) => row.batch?.batch_number ?? "—",
    },
  ];

  if (isLoading) return <TableSkeleton />;

  return (
    <View style={{ flex: 1 }}>
      <CustomTable<InventoryStockDetail>
        columns={columns}
        data={stockData || []}
        keyExtractor={(row) => row.id}
        itemsPerPage={5}
        onRowPress={hadleModal}
        getSearchableText={(row) =>
          [
            row.product?.name,
            row.product?.modifier_name,
            row.product?.sku,
            row.warehouse?.name,
            row.reference_number,
            row.reason,
            row.batch?.batch_number,
          ]
            .filter(Boolean)
            .join(" ")
        }
      />

      <ModalInventoryStockDetail
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={modal}
      />
    </View>
  );
};
