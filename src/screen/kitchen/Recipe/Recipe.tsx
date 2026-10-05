import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalRecipeDetail } from "@/components/molecules/ModalRecipeDetail/ModalRecipeDetail";
import { RecipeTable } from "@/components/templates/RecipeTable/RecipeTable";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useRecipe } from "@/src/hooks/useRecipe/useRecipe";
import { useRecipeStore } from "@/src/store/useRecipeStore/useRecipeStore";
import { Recipe as RecipeModel } from "@/src/types/recipe/recipe";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const RecipeScreen: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<RecipeModel | undefined>(
    undefined,
  );
  const [deleteData, setDeleteData] = useState<RecipeModel | undefined>(
    undefined,
  );
  const { data: recipes, isLoading, remove } = useRecipe();
  const { setData, setIsEdit } = useRecipeStore.getState();
  const { showToast } = useCustomToast();

  const handleDetail = (row: RecipeModel): void => {
    setDetailData(row);
    setShowDetailModal(true);
  };

  const handleEdit = (row: RecipeModel): void => {
    setIsEdit(true);
    setData(row);
    router.navigate("/(drawer)/(kitchen)/(form)/recipes_form");
  };

  const handleAskDelete = (row: RecipeModel): void => {
    setDeleteData(row);
    setShowDeleteModal(true);
  };

  const handleDelete = (): void => {
    if (!deleteData) return;
    remove.mutate(deleteData.product.id, {
      onSuccess: () =>
        showToast({
          message: "Receta eliminada correctamente",
          type: "success",
        }),
      onError: () =>
        showToast({
          message: "Error al eliminar la receta",
          type: "error",
        }),
    });
    setShowDeleteModal(false);
    setDeleteData(undefined);
  };

  const handleCreate = (): void => {
    setIsEdit(false);
    setData(undefined);
    router.navigate("/(drawer)/(kitchen)/(form)/recipes_form");
  };

  const actions: Action<RecipeModel>[] = [
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
      <RecipeTable
        data={recipes ?? []}
        itemsPerPage={5}
        onNewRecipe={handleCreate}
        onRowPress={handleDetail}
        actions={actions}
      />
      <ModalRecipeDetail
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
