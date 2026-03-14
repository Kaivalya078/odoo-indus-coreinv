import apiClient from "./apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role_name: string | null;
  is_active: boolean;
  created_at: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    apiClient.post<TokenResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    apiClient.post<UserResponse>("/auth/register", data).then((r) => r.data),

  getMe: () =>
    apiClient.get<UserResponse>("/auth/me").then((r) => r.data),
};
