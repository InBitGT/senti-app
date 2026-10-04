import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalPackagingDetail } from "@/components/molecules/ModalPackagingDetail/ModalPackagingDetail";
import { PackagingTable } from "@/components/templates/PackagingTable/PackagingTable";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { usePackaging } from "@/src/hooks/usePackaging/usePackaging";
import { usePackagingStore } from "@/src/store/usePackagingStore/usePackagingStore";
import { Packaging as PackagingModel } from "@/src/types/packaging/packaging";
import React, { useState } from "react";
import { View } from "react-native";

export const PackagingScreen: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<PackagingModel | undefined>(
    undefined,
  );
  const [deleteData, setDeleteData] = useState<PackagingModel | undefined>(
    undefined,
  );
  const { data: packagings, isLoading, remove } = usePackaging();
  const { setData, setIsEdit } = usePackagingStore.getState();
  const { showToast } = useCustomToast();

  const handleDetail = (row: PackagingModel): void => {
    setDetailData(row);
    setShowDetailModal(true);
  };

  const handleEdit = (row: PackagingModel): void => {
    setIsEdit(true);
    setData(row);
    // router.navigate(FORM_ROUTE);
  };

  const handleAskDelete = (row: PackagingModel): void => {
    setDeleteData(row);
    setShowDeleteModal(true);
  };

  const handleDelete = (): void => {
    if (!deleteData) return;
    remove.mutate(deleteData.id, {
      onSuccess: () =>
        showToast({
          message: "Empaque eliminado correctamente",
          type: "success",
        }),
      onError: () =>
        showToast({ message: "Error al eliminar el empaque", type: "error" }),
    });
    setShowDeleteModal(false);
    setDeleteData(undefined);
  };

  const handleCreate = (): void => {
    setIsEdit(false);
    setData(undefined);
    // router.navigate();
  };

  const actions: Action<PackagingModel>[] = [
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
      <PackagingTable
        data={packagings ?? []}
        itemsPerPage={5}
        onNewPackaging={handleCreate}
        onRowPress={handleDetail}
        actions={actions}
      />
      <ModalPackagingDetail
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
