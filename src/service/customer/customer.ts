import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { CreateCustomer, Customer } from "@/src/types/customer/customer";

export async function customerFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<Customer[]>(
    ENDPOINT.customer.detail(claims.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostCustomer(data: CreateCustomer) {
  const response = await post<CreateCustomer>(ENDPOINT.customer.info, data);
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutCustomer({
  id,
  data,
}: {
  id: number;
  data: Customer;
}) {
  const response = await put<Customer>(ENDPOINT.customer.info + "/" + id, data);
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteCustomer(IdData: string | number) {
  const response = await remove<Customer>(
    ENDPOINT.customer.info + "/" + IdData,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
