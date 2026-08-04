import { PostLoanPayments } from "@/src/service/loan_payments/loan_payments";
import { LoanPayments } from "@/src/types/loan_payments/loan_payments";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type PostLoanPaymentsVariables = {
  data: LoanPayments;
  idCustomer: string | number;
};

const KEY = ["loan-payments"];

export function useLoanPayments() {
  const queryClient = useQueryClient();

  const post = useMutation({
    mutationFn: ({ data, idCustomer }: PostLoanPaymentsVariables) =>
      PostLoanPayments(data, idCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["credit"] });
    },
  });

  return { post };
}
