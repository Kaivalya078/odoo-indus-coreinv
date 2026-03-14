import apiClient from "./apiClient";

export interface SupplierCreate {
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierUpdate {
  name?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierResponse {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export const supplierService = {
  getSuppliers: () =>
    apiClient.get<SupplierResponse[]>("/suppliers").then((r) => r.data),

  getSupplier: (id: string) =>
    apiClient.get<SupplierResponse>(`/suppliers/${id}`).then((r) => r.data),

  createSupplier: (data: SupplierCreate) =>
    apiClient.post<SupplierResponse>("/suppliers", data).then((r) => r.data),

  updateSupplier: (id: string, data: SupplierUpdate) =>
    apiClient.put<SupplierResponse>(`/suppliers/${id}`, data).then((r) => r.data),

  deleteSupplier: (id: string) =>
    apiClient.delete<SupplierResponse>(`/suppliers/${id}`).then((r) => r.data),
};
