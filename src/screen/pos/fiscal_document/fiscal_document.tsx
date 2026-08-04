import { ModalFiscalDocumentDetail } from "@/components/molecules/ModalFiscalDocumentDetail/ModalFiscalDocumentDetail";
import { FiscalDocumentsTable } from "@/components/templates/FiscalDocumentTable/FiscalDocumentTable";
import { FiscalDocument as FiscalDocumentModel } from "@/src/types/fiscal_document/fiscal_document";
import React, { useState } from "react";
import { View } from "react-native";

export const FiscalDocumentScreen: React.FC = () => {
  const [showModalData, setShowModalData] = useState<boolean>(false);
  const [modalData, setModalData] = useState<FiscalDocumentModel | undefined>(
    undefined,
  );

  const handleRowPress = (data: FiscalDocumentModel) => {
    setShowModalData(true);
    setModalData(data);
  };

  return (
    <View style={{ flex: 1 }}>
      <FiscalDocumentsTable itemsPerPage={5} onRowPress={handleRowPress} />
      <ModalFiscalDocumentDetail
        isOpen={showModalData}
        onClose={() => setShowModalData(false)}
        data={modalData}
      />
    </View>
  );
};
