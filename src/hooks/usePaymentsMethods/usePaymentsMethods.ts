import { paymentMethodFn } from "@/src/service/payments_methods/payments_methods";
import { useQuery } from "@tanstack/react-query";

const PAYMENT_METHOD_KEY = ["payment-methods"];

export function usePaymentMethod() {
  const { data, isLoading } = useQuery({
    queryKey: PAYMENT_METHOD_KEY,
    queryFn: paymentMethodFn,
  });

  return { data, isLoading };
}
