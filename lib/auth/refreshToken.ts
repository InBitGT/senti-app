import { API_BASE_URL, ENDPOINT } from "@/lib";
import { storage } from "@/lib/storage/storage";
import { useAuthStore } from "@/src/store/useAuthStore";
import { ApiResponse } from "@/src/types";
import axios from "axios";

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

let refreshPromise: Promise<string> | null = null;

const clearSession = async (): Promise<void> => {
  await storage.removeItem("access_token");
  await storage.removeItem("refresh_token");
  await storage.removeItem("expires_in");
  useAuthStore.getState().clearClaims();
};

const requestNewToken = async (): Promise<string> => {
  try {
    const refreshToken = await storage.getItem("refresh_token");
    const claims = useAuthStore.getState().claims;

    const { data } = await axios.post<ApiResponse<RefreshResponse>>(
      `${API_BASE_URL}${ENDPOINT.auth.refreshToken}`,
      { user_id: claims?.sub, refresh_token: refreshToken },
    );

    const newToken = data?.data?.access_token;
    if (!newToken) throw new Error("Refresh sin access_token");

    await storage.setItem("access_token", newToken);
    if (data?.data?.refresh_token) {
      await storage.setItem("refresh_token", data.data.refresh_token);
    }
    if (data?.data?.expires_in) {
      await storage.setItem("expires_in", String(data.data.expires_in));
    }

    useAuthStore.getState().setClaims(newToken);
    return newToken;
  } catch (error: unknown) {
    await clearSession();
    throw error;
  }
};

// Single-flight: todas las llamadas concurrentes comparten la misma promesa
export const refreshAccessToken = (): Promise<string> => {
  refreshPromise ??= requestNewToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};
