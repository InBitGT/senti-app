import {
  Action,
  Buttons,
  ColumnDef,
  CustomTable,
  ModalDelete,
} from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalPrepStationDetail } from "@/components/molecules/ModalPrepStationDetail/ModalPrepStationDetail";
import { Text } from "@/components/ui/text";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { usePrepStation } from "@/src/hooks/usePrepStation/usePrepStation";
import { usePrepStationStore } from "@/src/store/usePrepStationStore/usePrepStationStore";
import { PrepStation } from "@/src/types/prep_station/prep_station.types";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

const MAX_PREP_STATIONS = 3;

export const PrepStationScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modal, setModal] = useState<PrepStation | undefined>(undefined);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setModalData] = useState<PrepStation | undefined>(
    undefined,
  );
  const { data: stations, isLoading, remove } = usePrepStation();
  const { setData, setIsEdit, clearData } = usePrepStationStore.getState();
  const { showToast } = useCustomToast();
  const canCreate = (stations?.length ?? 0) < MAX_PREP_STATIONS;

  const handleCreate = () => {
    if (!canCreate) return;
    clearData();
    setIsEdit(false);
    router.navigate("/(drawer)/(config)/(form)/prep_station_form");
  };

  const handleEdit = (row: PrepStation) => {
    setIsEdit(true);
    setData(row);
    router.navigate("/(drawer)/(config)/(form)/prep_station_form");
  };

  const handleModalData = (row: PrepStation) => {
    setModalData(row);
    setShowModalData(true);
  };

  const handleModal = (row: PrepStation) => {
    setShowModal(true);
    setModal(row);
  };

  const handleDelete = async () => {
    if (!modal) return;
    setShowModal(false);
    try {
      await remove.mutateAsync(modal.id);
      showToast({ message: "Se eliminó la estación", type: "success" });
    } catch {
      showToast({ message: "Error al eliminar la estación", type: "error" });
    }
  };

  const columns: ColumnDef<PrepStation>[] = [
    { key: "id", title: "ID" },
    { key: "name", title: "Nombre" },
    { key: "code", title: "Código" },
    {
      key: "categories",
      title: "Categorías",
      render: (row) => (
        <Text size="sm">
          {row.categories.length
            ? row.categories
                .map((category) => category.category_name)
                .join(", ")
            : "—"}
        </Text>
      ),
    },
    {
      key: "products",
      title: "Productos",
      render: (row) => (
        <Text size="sm">
          {row.products.length
            ? row.products.map((product) => product.product_name).join(", ")
            : "—"}
        </Text>
      ),
    },
  ];

  const actions: Action<PrepStation>[] = [
    { icon: "pencil", label: "Editar", onPress: (row) => handleEdit(row) },
    { icon: "delete", label: "Eliminar", onPress: (row) => handleModal(row) },
  ];

  const dataButton: Buttons[] = canCreate
    ? [{ name: "Crear Estación", onPress: handleCreate, variant: "solid" }]
    : [];

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomTable<PrepStation>
        columns={columns}
        data={stations ?? []}
        keyExtractor={(row) => row.id}
        actions={actions}
        itemsPerPage={5}
        button={dataButton}
        searchKeys={["name", "code"]}
        onRowPress={handleModalData}
      />
      <ModalPrepStationDetail
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
