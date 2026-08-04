import { get } from "@/apis";
import { ENDPOINT } from "@/lib";
import { FiscalDocument } from "@/src/types/fiscal_document/fiscal_document";

export async function fiscalDocumentFn(branchId: string | number) {
  const response = await get<FiscalDocument[]>(
    ENDPOINT.fiscalDocument.detail(branchId),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
