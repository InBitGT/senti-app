import { post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { LoginCredentials, LoginResponse, RefreshTokenRequest } from "@/src/types";

export async function loginFn(credentials: LoginCredentials) {
    console.log("credenciales", credentials)
  const response = await post<LoginResponse>(ENDPOINT.auth.login, credentials);
  console.log(response, "response")

  if (response.code !== "200") {
    throw new Error(response.message);
  }

  return response.data;
}


export async function refreshTokenFn(data: RefreshTokenRequest) {
    const response = await post<LoginResponse>(ENDPOINT.auth.refreshToken, data)
    
    if (response.code !== "200") {
        throw new Error(response.message);
    }

    return response.data;
}