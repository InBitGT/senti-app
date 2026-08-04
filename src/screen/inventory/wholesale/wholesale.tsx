import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalProductWholesaleDetail } from "@/components/molecules/ModalProductWholesaleDetail/ModalProductWholesaleDetail";
import { ProductWholesaleTable } from "@/components/templates/WholesaleTable/WholesaleTable";
import { useProductWholesale } from "@/src/hooks/useWholesale/useWholesale";
import { useProductWholesaleStore } from "@/src/store/useWholesaleStore/useWholesaleStore";
import { ProductWholesaleRule as ProductWholesaleModel } from "@/src/types/wholesale/wholesale";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const ProductWholesale: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<ProductWholesaleModel | undefined>(
    undefined,
  );
  const [modal, setmodal] = useState<ProductWholesaleModel | undefined>(
    undefined,
  );
  const { data: rules, isLoading, remove } = useProductWholesale();
  const { setData, setIsEdit } = useProductWholesaleStore.getState();

  const hadleModalData = (data: ProductWholesaleModel) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: ProductWholesaleModel) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(inventory)/(form)/wholesale_form");
  };

  const hadleModal = (data: ProductWholesaleModel) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<ProductWholesaleModel>[] = [
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
    router.navigate("/(drawer)/(inventory)/(form)/wholesale_form");
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ProductWholesaleTable
        data={rules || []}
        itemsPerPage={5}
        onNewRule={handleCreate}
        onRowPress={hadleModalData}
        actions={actions}
      />
      <ModalProductWholesaleDetail
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
