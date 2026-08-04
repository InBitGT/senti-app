import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalCustomerTypeDetail } from "@/components/molecules/ModalCustomerTypeDetail/ModalCustomerTypeDetail";
import { CustomerTypesTable } from "@/components/templates/CustomerTypesTable/CustomerTypesTable";
import { useCustomerType } from "@/src/hooks/useCustomerType/useCustomerType";
import { useCustomerTypeStore } from "@/src/store/useCustomerTypeStore/useCustomerTypeStore";
import { CustomerType as CustomerTypeModel } from "@/src/types/customer_type/customer_type";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const CustomerType: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<CustomerTypeModel | undefined>(
    undefined,
  );
  const [modal, setmodal] = useState<CustomerTypeModel | undefined>(undefined);
  const { data: customerTypes, isLoading, remove } = useCustomerType();
  const { setData, setIsEdit } = useCustomerTypeStore.getState();

  const hadleModalData = (data: CustomerTypeModel) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: CustomerTypeModel) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(portfolio)/(form)/client_type_form");
  };

  const hadleModal = (data: CustomerTypeModel) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<CustomerTypeModel>[] = [
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
    router.navigate("/(drawer)/(portfolio)/(form)/client_type_form");
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomerTypesTable
        data={customerTypes || []}
        itemsPerPage={5}
        onNewCustomerType={handleCreate}
        onRowPress={hadleModalData}
        actions={actions}
      />
      <ModalCustomerTypeDetail
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
