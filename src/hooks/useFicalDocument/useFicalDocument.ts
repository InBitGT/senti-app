import {
  fiscalDocumentByIDFn,
  fiscalDocumentFn,
} from "@/src/service/fical_document/fical_document";
import { useQuery } from "@tanstack/react-query";

export const useFiscalDocument = (branchId?: string | number) => {
  const { data, isLoading } = useQuery({
    queryKey: ["fiscal-documents", branchId],
    queryFn: () => fiscalDocumentFn(branchId ?? ""),
    enabled: branchId !== undefined && branchId !== 0 && branchId !== "",
  });

  return { data, isLoading };
};

export const useFiscalDocumentDetail = (id?: string | number) => {
  const { data, isLoading } = useQuery({
    queryKey: ["fiscal-documents", "detail", id],
    queryFn: () => fiscalDocumentByIDFn(id ?? ""),
    enabled: id !== undefined && id !== 0 && id !== "",
  });

  return { data, isLoading };
};
