import { Action, Buttons, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalMerchandiseDetail } from "@/components/molecules/ModalMerchandise/ModalMerchandise";
import { MerchandiseTable } from "@/components/templates/MerchandiseTable/MerchandiseTable";
import { useMerchandise } from "@/src/hooks/useMerchandise/useMerchandise";
import { useMerchandiseStore } from "@/src/store/useMerchandiseStore/useMerchandiseStore";
import { Merchandise } from "@/src/types/merchandise/merchandise.types";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView } from "react-native";

export const MerchandiseScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modal, setmodal] = useState<Merchandise | undefined>(undefined);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<Merchandise>();
  const { data: merchandise, isLoading, remove } = useMerchandise();
  const { setData, setIsEdit } = useMerchandiseStore.getState();

  const hadleModalData = (data: Merchandise) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: Merchandise) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(inventory)/(form)/merchandise_form");
  };

  const hadleModal = (data: Merchandise) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<Merchandise>[] = [
    { icon: "pencil", label: "Editar", onPress: (row) => handleEdit(row) },
    { icon: "delete", label: "Eliminar", onPress: (row) => hadleModal(row) },
  ];

  const dataButton: Buttons[] = [
    {
      key: "create-merchandise",
      name: "Crear Producto",
      icon: Plus,
      onPress: () =>
        router.navigate("/(drawer)/(inventory)/(form)/merchandise_form"),
      variant: "solid",
    },
  ];

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <MerchandiseTable
        data={merchandise || []}
        itemsPerPage={8}
        button={dataButton}
        actions={actions}
        onRowPress={hadleModalData}
      />
      <ModalMerchandiseDetail
        isOpen={showModalData}
        onClose={() => setShowModalData(false)}
        data={modalData}
      />
      <ModalDelete
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleDelete}
      />
    </ScrollView>
  );
};
