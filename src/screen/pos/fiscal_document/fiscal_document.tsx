// FiscalDocumentScreen.tsx
import { ModalFiscalDocumentDetail } from "@/components/molecules/ModalFiscalDocumentDetail/ModalFiscalDocumentDetail";
import { FiscalDocumentsTable } from "@/components/templates/FiscalDocumentTable/FiscalDocumentTable";
import { useFiscalDocumentStore } from "@/src/store/useFiscalDocumentStore/useFiscalDocumentStore";
import { FiscalDocument as FiscalDocumentModel } from "@/src/types/fiscal_document/fiscal_document";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

export const FiscalDocumentScreen: React.FC = () => {
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setModalData] = useState<FiscalDocumentModel | undefined>(
    undefined,
  );

  const setSelectedId = useFiscalDocumentStore((s) => s.setSelectedId);

  const handleRowPress = (data: FiscalDocumentModel) => {
    setShowModalData(true);
    setModalData(data);
  };

  const handleViewDetail = (id: number) => {
    setSelectedId(id);
    setShowModalData(false);
    router.push("/(drawer)/(pos)/(info)/invoices_info");
  };

  return (
    <View style={{ flex: 1 }}>
      <FiscalDocumentsTable itemsPerPage={5} onRowPress={handleRowPress} />
      <ModalFiscalDocumentDetail
        isOpen={showModalData}
        onClose={() => setShowModalData(false)}
        data={modalData}
        onViewDetail={handleViewDetail}
      />
    </View>
  );
};
