import { Action, Buttons, ModalDelete } from "@/components";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalUnitDetail } from "@/components/molecules/ModalUnitDetail/ModalUnitDetail";
import { UnitsTable } from "@/components/templates/UnitsTable/UnitsTable";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useUnitStore } from "@/src/store/useUnitMeasure/useUnitMeasureStore";
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView } from "react-native";

export const Unit: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modal, setmodal] = useState<UnitOfMeasure | undefined>(undefined);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<UnitOfMeasure>();
  const { data: units, isLoading, remove } = useUnit();
  const { setData, setIsEdit } = useUnitStore.getState();

  const hadleModalData = (data: UnitOfMeasure) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: UnitOfMeasure) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(inventory)/(form)/unit_measure_form");
  };

  const hadleModal = (data: UnitOfMeasure) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<UnitOfMeasure>[] = [
    { icon: "pencil", label: "Editar", onPress: (row) => handleEdit(row) },
    { icon: "delete", label: "Eliminar", onPress: (row) => hadleModal(row) },
  ];

  const dataButton: Buttons[] = [
    {
      key: "crear_unit",
      name: "Crear Unidad",
      icon: Plus,
      onPress: () =>
        router.navigate("/(drawer)/(inventory)/(form)/unit_measure_form"),
      variant: "solid",
    },
  ];

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <DesktopScrollView>
        <UnitsTable
          data={units || []}
          itemsPerPage={8}
          button={dataButton}
          actions={actions}
          onRowPress={hadleModalData}
        />
        <ModalUnitDetail
          isOpen={showModalData}
          onClose={() => setShowModalData(false)}
          data={modalData}
        />
        <ModalDelete
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleDelete}
        />
      </DesktopScrollView>
    </ScrollView>
  );
};
