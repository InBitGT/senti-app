import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import { CreateCredit, CustomerCredit } from "@/src/types/credit/credit";

export async function creditFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<CustomerCredit[]>(
    ENDPOINT.credit.detail(claims.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostCustomerCredit(data: CreateCredit) {
  const response = await post<CreateCredit>(ENDPOINT.credit.info, data);
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutCustomerCredit({
  id,
  data,
}: {
  id: number;
  data: CustomerCredit;
}) {
  const response = await put<CustomerCredit>(
    ENDPOINT.credit.info + "/" + id,
    data,
  );
  console.log(response, "put");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteCustomerCredit(IdData: string | number) {
  const response = await remove<CustomerCredit>(
    ENDPOINT.credit.info + "/" + IdData,
  );
  console.log(response, "remove");

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
