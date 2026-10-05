import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalServiceDetail } from "@/components/molecules/ModalServiceDetail/ModalServiceDetail";
import { ServiceProductTable } from "@/components/templates/ServiceProductTable/ServiceProductTable";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useServiceProduct } from "@/src/hooks/useServiceProduct/useServiceProduct";
import { useServiceProductStore } from "@/src/store/useServiceProductStore/useServiceProductStore";
import { ServiceProduct } from "@/src/types/service/service";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const ServiceScreen: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<ServiceProduct | undefined>(
    undefined,
  );
  const [deleteData, setDeleteData] = useState<ServiceProduct | undefined>(
    undefined,
  );
  const { data: services, isLoading, remove } = useServiceProduct();
  const { setData, setIsEdit } = useServiceProductStore.getState();
  const { showToast } = useCustomToast();

  const handleDetail = (row: ServiceProduct): void => {
    setDetailData(row);
    setShowDetailModal(true);
  };

  const handleEdit = (row: ServiceProduct): void => {
    setIsEdit(true);
    setData(row);
    router.navigate("/(drawer)/(inventory)/(form)/service_form");
  };

  const handleAskDelete = (row: ServiceProduct): void => {
    setDeleteData(row);
    setShowDeleteModal(true);
  };

  const handleDelete = (): void => {
    if (!deleteData) return;
    remove.mutate(deleteData.product.id, {
      onSuccess: () =>
        showToast({
          message: "Servicio eliminado correctamente",
          type: "success",
        }),
      onError: () =>
        showToast({
          message: "Error al eliminar el servicio",
          type: "error",
        }),
    });
    setShowDeleteModal(false);
    setDeleteData(undefined);
  };

  const handleCreate = (): void => {
    setIsEdit(false);
    setData(undefined);
    router.navigate("/(drawer)/(inventory)/(form)/service_form");
  };

  const actions: Action<ServiceProduct>[] = [
    {
      icon: "pencil",
      label: "Editar",
      onPress: (row) => handleEdit(row),
    },
    {
      icon: "delete",
      label: "Eliminar",
      onPress: (row) => handleAskDelete(row),
    },
  ];

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ServiceProductTable
        data={services ?? []}
        itemsPerPage={5}
        onNewService={handleCreate}
        onRowPress={handleDetail}
        actions={actions}
      />
      <ModalServiceDetail
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        data={detailData}
      />
      <ModalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDelete}
      />
    </View>
  );
};
