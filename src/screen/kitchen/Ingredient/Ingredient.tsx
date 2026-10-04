import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalIngredientDetail } from "@/components/molecules/ModalIngredientDetail/ModalIngredientDetail";
import { IngredientTable } from "@/components/templates/IngredientTable/IngredientTable";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useIngredient } from "@/src/hooks/useIngredient/useIngredient";
import { useIngredientStore } from "@/src/store/useIngredientStore/useIngredientStore";
import { Ingredient as IngredientModel } from "@/src/types/ingredient/ingredient";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const IngredientScreen: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<IngredientModel | undefined>(
    undefined,
  );
  const [deleteData, setDeleteData] = useState<IngredientModel | undefined>(
    undefined,
  );
  const { data: ingredients, isLoading, remove } = useIngredient();
  const { setData, setIsEdit } = useIngredientStore.getState();
  const { showToast } = useCustomToast();

  const handleDetail = (row: IngredientModel): void => {
    setDetailData(row);
    setShowDetailModal(true);
  };

  const handleEdit = (row: IngredientModel): void => {
    setIsEdit(true);
    setData(row);
    router.navigate("/(drawer)/(kitchen)/(form)/ingredient_form");
  };

  const handleAskDelete = (row: IngredientModel): void => {
    setDeleteData(row);
    setShowDeleteModal(true);
  };

  const handleDelete = (): void => {
    if (!deleteData) return;
    remove.mutate(deleteData.id, {
      onSuccess: () =>
        showToast({
          message: "Ingrediente eliminado correctamente",
          type: "success",
        }),
      onError: () =>
        showToast({
          message: "Error al eliminar el ingrediente",
          type: "error",
        }),
    });
    setShowDeleteModal(false);
    setDeleteData(undefined);
  };

  const handleCreate = (): void => {
    setIsEdit(false);
    setData(undefined);
    router.navigate("/(drawer)/(kitchen)/(form)/ingredient_form");
  };

  const actions: Action<IngredientModel>[] = [
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
      <IngredientTable
        data={ingredients ?? []}
        itemsPerPage={5}
        onNewIngredient={handleCreate}
        onRowPress={handleDetail}
        actions={actions}
      />
      <ModalIngredientDetail
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
