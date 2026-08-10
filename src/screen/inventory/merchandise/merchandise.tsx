import { Action, Buttons, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalMerchandiseDetail } from "@/components/molecules/ModalMerchandise/ModalMerchandise";
import { MerchandiseTable } from "@/components/templates/MerchandiseTable/MerchandiseTable";
import { useMerchandise } from "@/src/hooks/useMerchandise/useMerchandise";
import { useMerchandiseStore } from "@/src/store/useMerchandiseStore/useMerchandiseStore";
import { MerchandiseListItem } from "@/src/types/merchandise/merchandise.types";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView } from "react-native";

export const MerchandiseScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modal, setmodal] = useState<MerchandiseListItem | undefined>(
    undefined,
  );
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<MerchandiseListItem>();
  const { data: merchandise, isLoading, remove } = useMerchandise();
  const { setData, setIsEdit } = useMerchandiseStore.getState();

  const hadleModalData = (data: MerchandiseListItem) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: MerchandiseListItem) => {
    setIsEdit(true);
    // ⚠️ Si tu merchandise_form.tsx ya esperaba el shape plano (Merchandise),
    // ahora recibe el nested (MerchandiseListItem) y hay que ajustar ahí los
    // defaultValues para leer de data.product.* / data.price / data.wholesale_rule.
    setData(data);
    router.navigate("/(drawer)/(inventory)/(form)/merchandise_form");
  };

  const hadleModal = (data: MerchandiseListItem) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    // El id ya no está en la raíz — vive en modal.product.id.
    remove.mutate(modal.product.id);
    setShowModal(false);
  };

  const actions: Action<MerchandiseListItem>[] = [
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
