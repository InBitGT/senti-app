import { post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { LoginCredentials, LoginResponse } from "@/src/types";

export async function loginFn(credentials: LoginCredentials) {
  const response = await post<LoginResponse>(ENDPOINT.auth.login, credentials);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}

export async function logoutFn(idUser: number) {
  const response = await post<LoginResponse>(ENDPOINT.auth.logout, idUser);

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}