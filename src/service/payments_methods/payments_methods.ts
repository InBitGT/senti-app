import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    CreatePaymentMethod,
    PaymentMethod,
} from "@/src/types/payment_methods/payment_methods";

export async function paymentMethodFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<PaymentMethod[]>(ENDPOINT.payments_methods.info);
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostPaymentMethod(data: CreatePaymentMethod) {
  const response = await post<CreatePaymentMethod>(
    ENDPOINT.payments_methods.info,
    data,
  );
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutPaymentMethod({
  id,
  data,
}: {
  id: number;
  data: PaymentMethod;
}) {
  const response = await put<PaymentMethod>(
    ENDPOINT.payments_methods.info + "/" + id,
    data,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeletePaymentMethod(IdData: string | number) {
  const response = await remove<PaymentMethod>(
    ENDPOINT.payments_methods.info + "/" + IdData,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
