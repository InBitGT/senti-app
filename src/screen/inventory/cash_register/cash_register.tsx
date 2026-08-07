import { Action, ModalDelete } from "@/components";
import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalCashRegisterDetail } from "@/components/molecules/ModalCashRegisterDetail/ModalCashRegisterDetail";
import { CashRegistersTable } from "@/components/templates/CashRegistersTable/CashRegistersTable";
import { useCashRegister } from "@/src/hooks/useCashRegister/useCashRegister";
import { useCashRegisterStore } from "@/src/store/useCashRegisterStore/useCashRegisterStore";
import { CashRegister as CashRegisterModel } from "@/src/types/cash_register/cash_register";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const CashRegisterScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setmodalData] = useState<CashRegisterModel | undefined>(
    undefined,
  );
  const [modal, setmodal] = useState<CashRegisterModel | undefined>(undefined);
  const { data: cashRegisters, isLoading, remove } = useCashRegister();
  const { setData, setIsEdit } = useCashRegisterStore.getState();

  const hadleModalData = (data: CashRegisterModel) => {
    setShowModalData(true);
    setmodalData(data);
  };

  const handleEdit = (data: CashRegisterModel) => {
    setIsEdit(true);
    setData(data);
    router.navigate("/(drawer)/(inventory)/(form)/cashier_form");
  };

  const hadleModal = (data: CashRegisterModel) => {
    setShowModal(true);
    setmodal(data);
  };

  const handleDelete = () => {
    if (!modal) return;
    remove.mutate(modal.id);
    setShowModal(false);
  };

  const actions: Action<CashRegisterModel>[] = [
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
    router.navigate("/(drawer)/(inventory)/(form)/cashier_form");
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CashRegistersTable
        data={cashRegisters || []}
        itemsPerPage={5}
        onNewCashRegister={handleCreate}
        onRowPress={hadleModalData}
        actions={actions}
      />
      <ModalCashRegisterDetail
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
