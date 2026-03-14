import apiClient from "./apiClient";

export interface TransferItemCreate {
  product_id: string;
  source_location_id: string;
  dest_location_id: string;
  quantity: number;
}

export interface TransferCreate {
  source_warehouse_id: string;
  dest_warehouse_id: string;
  notes?: string;
  scheduled_date?: string;
  items: TransferItemCreate[];
}

export interface TransferUpdate {
  notes?: string;
  scheduled_date?: string;
  items?: TransferItemCreate[];
}

export interface TransferItemResponse {
  id: string;
  product_id: string;
  product_name: string | null;
  source_location_id: string;
  source_location_name: string | null;
  dest_location_id: string;
  dest_location_name: string | null;
  quantity: number;
  created_at: string;
}

export interface TransferResponse {
  id: string;
  reference: string;
  source_warehouse_id: string;
  source_warehouse_name: string | null;
  dest_warehouse_id: string;
  dest_warehouse_name: string | null;
  status: string;
  notes: string | null;
  scheduled_date: string | null;
  created_by: string;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  items: TransferItemResponse[];
}

export const transferService = {
  getTransfers: (status?: string) =>
    apiClient.get<TransferResponse[]>("/transfers", { params: status ? { status } : {} }).then((r) => r.data),

  getTransfer: (id: string) =>
    apiClient.get<TransferResponse>(`/transfers/${id}`).then((r) => r.data),

  createTransfer: (data: TransferCreate) =>
    apiClient.post<TransferResponse>("/transfers", data).then((r) => r.data),

  updateTransfer: (id: string, data: TransferUpdate) =>
    apiClient.put<TransferResponse>(`/transfers/${id}`, data).then((r) => r.data),

  validateTransfer: (id: string) =>
    apiClient.post<TransferResponse>(`/transfers/${id}/validate`).then((r) => r.data),

  confirmTransfer: (id: string) =>
    apiClient.post<TransferResponse>(`/transfers/${id}/done`).then((r) => r.data),

  cancelTransfer: (id: string) =>
    apiClient.post<TransferResponse>(`/transfers/${id}/cancel`).then((r) => r.data),
};
