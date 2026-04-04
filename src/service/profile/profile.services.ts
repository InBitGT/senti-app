import { get, put } from "@/apis";
import { ENDPOINT } from "@/lib";
import { UpdateAddress, UserInfo, UserUpdate } from "@/src/types";

export async function profileUserInfoFn(idUser: string | number) {
  const response = await get<UserInfo>(ENDPOINT.profile.infoUser(idUser));
   
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function profileUserUpdatefoFn(idUser: string | number, data: UserUpdate) {
  const response = await put<UserInfo>(ENDPOINT.profile.infoUser(idUser), data);
   
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function profileAddressUpdateFn(idAddress: string | number, data: UpdateAddress) {
  const response = await put<UserInfo>(ENDPOINT.profile.Address(idAddress), data);
   
  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}
