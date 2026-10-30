import { get, post, put, remove } from "@/apis";
import { ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store";
import {
  Address,
  Role,
  UserBranchCreate,
  UserDetail,
  Users,
} from "@/src/types/user/user.types";

export async function userFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<Users[]>(ENDPOINT.user.detail(claims?.tenant_id));
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function rolesFn() {
  const { claims } = useAuthStore.getState();
  if (!claims) {
    throw new Error();
  }
  const response = await get<Role[]>(ENDPOINT.role.info);
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostUser(data: UserDetail) {
  const response = await post<Users>(ENDPOINT.user.info, data);
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutUser({ id, data }: { id: number; data: UserDetail }) {
  const response = await put<Users>(ENDPOINT.user.info + "/" + id, data);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteUser(IdUser: string | number) {
  const response = await remove<Users>(ENDPOINT.user.info + "/" + IdUser);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostAddress(data: Address) {
  const response = await post<Address>(ENDPOINT.address.info, data);
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PutAddress({ id, data }: { id: number; data: Address }) {
  const response = await put<Address>(ENDPOINT.address.info + "/" + id, data);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function DeleteAddress(idAddress: string | number) {
  const response = await remove<Address>(
    ENDPOINT.address.info + "/" + idAddress,
  );

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function PostUserBranch(data: UserBranchCreate) {
  const response = await post<UserBranchCreate>(ENDPOINT.userBranch.info, data);
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}
