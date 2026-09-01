import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalCustomerCreditDetail } from "@/components/molecules/ModalCustomerCredit/ModalCustomerCredit";
import { CustomerCreditsTable } from "@/components/templates/CustomerCreditTable/CustomerCreditTable";
import { useCredit } from "@/src/hooks/useCredit/useCredit";
import { useCustomerCreditStore } from "@/src/store/useCreditStore/useCreditStore";
import { CustomerCredit } from "@/src/types/credit/credit";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const CustomerCreditScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<CustomerCredit | undefined>(
    undefined,
  );
  const [modal, setmodal] = useState<CustomerCredit | undefined>(undefined);
  const { data: customerCredits, isLoading, remove } = useCredit();
  const { setData, setIsEdit } = useCustomerCreditStore.getState();

  const hadleModalData = (data: CustomerCredit) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: CustomerCredit) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(portfolio)/(form)/credit_form");
  };

  const hadleModal = (data: CustomerCredit) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<CustomerCredit>[] = [
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
    router.navigate("/(drawer)/(portfolio)/(form)/credit_form");
  };
  const handlePreviousCredit = () => {
    router.navigate("/(drawer)/(portfolio)/(form)/previous_credit");
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomerCreditsTable
        data={customerCredits || []}
        itemsPerPage={5}
        onNewCustomerCredit={handleCreate}
        onRowPress={hadleModalData}
        actions={actions}
        onCreditPrevious={handlePreviousCredit}
      />
      <ModalCustomerCreditDetail
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
