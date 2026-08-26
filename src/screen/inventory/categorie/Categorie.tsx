import {
  Action,
  Buttons,
  ColumnDef,
  CustomTable,
  ModalDelete,
} from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalCategorieDetail } from "@/components/molecules/ModalCategorieDetail/ModalCategorieDetail";
import { useCategorie } from "@/src/hooks";
import { useCategorieStore } from "@/src/store/useCategorieStore";
import { Category } from "@/src/types";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const Categorie: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modal, setmodal] = useState<Category | undefined>(undefined);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<Category | undefined>(undefined);
  const { data: categorie, isLoading, remove } = useCategorie();
  const { setData, setIsEdit } = useCategorieStore.getState();

  const handleEdit = (data: Category) => {
    setIsEdit(true);
    console.log(data, "valores de la data");
    setData(data);
    router.navigate("/(drawer)/(inventory)/(form)/categorie_form");
  };

  const hadleModal = (data: Category) => {
    setShowModal(true);
    setmodal(data);
  };

  const hadleModalData = (data: Category) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const columns: ColumnDef<Category>[] = [
    { key: "id", title: "ID" },
    { key: "name", title: "Nombre" },
    { key: "description", title: "Descripción" },
  ];

  const actions: Action<Category>[] = [
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

  const dataButton: Buttons[] = [
    {
      name: "Crear Categoria",
      onPress: () =>
        router.navigate("/(drawer)/(inventory)/(form)/categorie_form"),
      variant: "solid",
    },
  ];

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomTable<Category>
        columns={columns}
        data={categorie || []}
        keyExtractor={(row) => row.id}
        actions={actions}
        itemsPerPage={10}
        button={dataButton}
        onRowPress={hadleModalData}
      />
      <ModalCategorieDetail
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
