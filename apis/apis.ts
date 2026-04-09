import { API_BASE_URL, ENDPOINT } from "@/lib";
import { useAuthStore } from "@/src/store/useAuthStore";
import { ApiResponse } from "@/src/types";
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";


interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (token) {
      item.resolve(token);
    } else {
      item.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        const claims = useAuthStore.getState().claims;

        const { data } = await axios.post<ApiResponse<RefreshResponse>>(
          `${API_BASE_URL}${ENDPOINT.auth.refreshToken}`,
          {
            user_id: claims?.sub,
            refresh_token: refreshToken,
          }
        );

        const newToken = data?.data?.access_token;
        if(!newToken) return
        await SecureStore.setItemAsync("access_token", newToken);

        if (data?.data?.refresh_token) {
          await SecureStore.setItemAsync("refresh_token", data.data.refresh_token);
        }

        if (data?.data?.expires_in) {
          await SecureStore.setItemAsync("expires_in", String(data.data.expires_in));
        }

        // Actualiza claims con el nuevo token
        useAuthStore.getState().setClaims(newToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);

        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("expires_in");
        useAuthStore.getState().clearClaims();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---- HELPERS ----

const handleRequest = async <T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> => {
  try {
    const response = await request;
    return {
      code: response.data.code,
      message: response.data.message || "Success",
      data: response.data.data,
    };
  } catch (error: any) {
     return {
      code: error.response?.status || 500,
      message:
        error.response?.data?.message || error.message || "An error occurred",
      data: null as T,
    };
  }
};

export const get = async <T>(url: string): Promise<ApiResponse<T>> =>
  handleRequest<T>(api.get<ApiResponse<T>>(url));

export const post = async <TResponse, TBody = unknown>(
  url: string,
  data: TBody
): Promise<ApiResponse<TResponse>> =>
  handleRequest<TResponse>(api.post<ApiResponse<TResponse>>(url, data));

export const put = async <TResponse, TBody = unknown>(
  url: string,
  data: TBody
): Promise<ApiResponse<TResponse>> =>
  handleRequest<TResponse>(api.put<ApiResponse<TResponse>>(url, data));

export const patch = async <TResponse, TBody = unknown>(
  url: string,
  data: TBody
): Promise<ApiResponse<TResponse>> =>
  handleRequest<TResponse>(api.patch<ApiResponse<TResponse>>(url, data));

export const remove = async <T>(url: string): Promise<ApiResponse<T>> =>
  handleRequest<T>(api.delete<ApiResponse<T>>(url));