import { Customer } from "@/src/types/customer/customer";
import { PaymentMethod } from "@/src/types/payment_methods/payment_methods";
import { printOnSale } from "@/src/service/printer/printOnSale";
import { CatalogFn, CheckoutFn } from "@/src/service/pos/pos";
import { useVaucherStore } from "@/src/store/useVaucherStore/useVaucherStore";
import { CheckoutPayload } from "@/src/types/pos/pos";
import { Vaucher } from "@/src/types/vaucher/vaucher";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCatalog = () => {
  const { setOrder } = useVaucherStore();
  const queryClient = useQueryClient();

  const {
    data: catalog,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pos-catalog"],
    queryFn: CatalogFn,
  });

  const checkout = useMutation<Vaucher | undefined, Error, CheckoutPayload>({
    mutationFn: CheckoutFn,
    onSuccess: (data) => {
      if (data) {
        setOrder(data);
        // Si el modo es "Al hacer una venta", imprime el ticket de cocina.
        printOnSale(data, {
          paymentMethods: queryClient.getQueryData<PaymentMethod[]>([
            "payment-methods",
          ]),
          customers: queryClient.getQueryData<Customer[]>(["customers"]),
        });
        queryClient.invalidateQueries({
          queryKey: [
            "credit",
            "loan-payments",
            "pos-catalog",
            "customers",
            "fiscal-documents",
          ],
        });
      }
    },
  });

  return { catalog, isError, isLoading, refetch, checkout };
};
