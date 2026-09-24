import { Buttons } from "@/components";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import {
  EntryDetail,
  ModalEntryDetail,
} from "@/components/molecules/EntryDetail/EntryDetail";
import { StockEntryTable } from "@/components/templates/StockEntryTable/StockEntryTable";
import { useEntryStock } from "@/src/hooks/useEntryStock/useEntryStock";
import { useEntryStockStore } from "@/src/store/useEntryStockStore/useEntryStockStore";
import { StockEntry } from "@/src/types/entry_stock/entry_stock.types";
import { useDimensions } from "@/src/utils/dimentions/dimentions";
import { router } from "expo-router";
import { ClipboardEdit, PackagePlus } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView } from "react-native";

export const Entry_stock = () => {
  const { data: entries, isLoading } = useEntryStock();
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<EntryDetail>();
  const setSelectedId = useEntryStockStore((s) => s.setSelectedId);
  const isDesktopWeb = useDimensions();

  const hadleModalData = (data: StockEntry) => {
    setShowModalData(true);

    setmodalData(data as EntryDetail);
  };

  const handleViewDetail = (id: number) => {
    setSelectedId(id);
    setShowModalData(false);
    router.navigate("/(drawer)/(inventory)/(info)/entry_stock_info");
  };

  const dataButton: Buttons[] = [
    {
      name: "Agregar ingreso de inventario",
      onPress: () =>
        router.navigate("/(drawer)/(inventory)/(form)/entry_stock_form"),
      icon: PackagePlus,
      variant: "outline",
    },
    {
      name: "Agregar ajuste de inventario",
      onPress: () =>
        router.navigate(
          "/(drawer)/(inventory)/(form)/inventory_adjustment_form",
        ),
      icon: ClipboardEdit,
      variant: "outline",
    },
  ];

  if (isLoading) return null;

  return (
    <ScrollView style={{ flex: 1, margin: isDesktopWeb ? 20 : 0 }}>
      <DesktopScrollView>
        <StockEntryTable
          data={entries || []}
          itemsPerPage={8}
          onRowPress={hadleModalData}
          button={dataButton}
        />

        <ModalEntryDetail
          isOpen={showModalData}
          onClose={() => setShowModalData(false)}
          data={modalData}
          onViewDetail={handleViewDetail}
        />
      </DesktopScrollView>
    </ScrollView>
  );
};
