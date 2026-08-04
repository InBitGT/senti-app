import { post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { LoanPayments } from "@/src/types/loan_payments/loan_payments";

export async function PostLoanPayments(
  data: LoanPayments,
  idCustomer: string | number,
) {
  const response = await post<LoanPayments>(
    ENDPOINT.loanPayments.loan(idCustomer),
    data,
  );

  console.log(response, "post", data);
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
