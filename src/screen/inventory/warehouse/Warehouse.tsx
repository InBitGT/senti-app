import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalWarehouseDetail } from "@/components/molecules/ModalWarehouse/ModalWarehouseDetail";
import { WarehousesTable } from "@/components/templates/WarehouseTable/WarehouseTable";
import { useWarehouse } from "@/src/hooks/useWarehouse/useWarehouse";
import { useWarehouseStore } from "@/src/store/useWarehouseStore/useWarehouseStore";
import { Warehouse as WarehouseModel } from "@/src/types/warehouse/warehouse.types";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const Warehouse: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<WarehouseModel | undefined>(
    undefined,
  );
  const [modal, setmodal] = useState<WarehouseModel | undefined>(undefined);
  const { data: warehouses, isLoading, remove } = useWarehouse();
  const { setData, setIsEdit } = useWarehouseStore.getState();

  const hadleModalData = (data: WarehouseModel) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: WarehouseModel) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(inventory)/(form)/warehouse_form");
  };

  const hadleModal = (data: WarehouseModel) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<WarehouseModel>[] = [
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
    router.navigate("/(drawer)/(inventory)/(form)/warehouse_form");
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <WarehousesTable
        data={warehouses || []}
        itemsPerPage={5}
        onNewWarehouse={handleCreate}
        onRowPress={hadleModalData}
        actions={actions}
      />
      <ModalWarehouseDetail
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
