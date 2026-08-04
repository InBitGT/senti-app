import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalCustomerCreditMovementDetail } from "@/components/molecules/ModalCustomerCreditMovementDetail/ModalCustomerCreditMovementDetail";
import { CustomerCreditMovementsTable } from "@/components/templates/MovementCreditTable/MovementCreditTable";
import { useMovementCredit } from "@/src/hooks/useMovementCredit/useMovementCredit";
import { CustomerCreditMovement } from "@/src/types/movement_credit/movement_credit";
import React, { useState } from "react";
import { View } from "react-native";

export const CreditMovementScreen: React.FC = () => {
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setModalData] = useState<
    CustomerCreditMovement | undefined
  >(undefined);
  const { data: movements, isLoading } = useMovementCredit();

  const handleRowPress = (data: CustomerCreditMovement) => {
    setShowModalData(true);
    setModalData(data);
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomerCreditMovementsTable
        data={movements || []}
        itemsPerPage={5}
        onRowPress={handleRowPress}
      />
      <ModalCustomerCreditMovementDetail
        isOpen={showModalData}
        onClose={() => setShowModalData(false)}
        data={modalData}
      />
    </View>
  );
};
