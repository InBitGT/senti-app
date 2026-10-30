import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
    CreateCustomerType,
    CustomerType,
} from "@/src/types/customer_type/customer_type";

export async function customerTypeFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<CustomerType[]>(
    ENDPOINT.customerType.detail(claims.tenant_id),
  );
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostCustomerType(data: CreateCustomerType) {
  const response = await post<CreateCustomerType>(
    ENDPOINT.customerType.info,
    data,
  );
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutCustomerType({
  id,
  data,
}: {
  id: number;
  data: CustomerType;
}) {
  const response = await put<CustomerType>(
    ENDPOINT.customerType.info + "/" + id,
    data,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteCustomerType(IdData: string | number) {
  const response = await remove<CustomerType>(
    ENDPOINT.customerType.info + "/" + IdData,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
