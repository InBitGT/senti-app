import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalCustomerDetail } from "@/components/molecules/ModalCustomerDetail/ModalCustomerDetail";
import { CustomersTable } from "@/components/templates/CustomerTable/CustomerTable";
import { useCustomer } from "@/src/hooks/useCustomer/useCustomer";
import { useCustomerStore } from "@/src/store/useCustomerStore/useCustomerStore";
import { Customer as CustomerModel } from "@/src/types/customer/customer";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const Customer: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<CustomerModel | undefined>(
    undefined,
  );
  const [modal, setmodal] = useState<CustomerModel | undefined>(undefined);
  const { data: customers, isLoading, remove } = useCustomer();
  const { setData, setIsEdit } = useCustomerStore.getState();

  const hadleModalData = (data: CustomerModel) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: CustomerModel) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(portfolio)/(form)/client_form");
  };

  const hadleModal = (data: CustomerModel) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<CustomerModel>[] = [
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
    router.navigate("/(drawer)/(portfolio)/(form)/client_form");
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomersTable
        data={customers || []}
        itemsPerPage={5}
        onNewCustomer={handleCreate}
        onRowPress={hadleModalData}
        actions={actions}
      />
      <ModalCustomerDetail
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
