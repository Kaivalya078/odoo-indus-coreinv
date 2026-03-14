import apiClient from "./apiClient";

export interface AdjustmentCreate {
  product_id: string;
  location_id: string;
  quantity: number;
  reason: string;
}

export interface AdjustmentResponse {
  id: string;
  reference: string;
  product_id: string;
  product_name: string | null;
  location_id: string;
  location_name: string | null;
  quantity: number;
  reason: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const adjustmentService = {
  getAdjustments: (status?: string) =>
    apiClient.get<AdjustmentResponse[]>("/adjustments", { params: status ? { status } : {} }).then((r) => r.data),

  getAdjustment: (id: string) =>
    apiClient.get<AdjustmentResponse>(`/adjustments/${id}`).then((r) => r.data),

  createAdjustment: (data: AdjustmentCreate) =>
    apiClient.post<AdjustmentResponse>("/adjustments", data).then((r) => r.data),

  confirmAdjustment: (id: string) =>
    apiClient.post<AdjustmentResponse>(`/adjustments/${id}/done`).then((r) => r.data),

  cancelAdjustment: (id: string) =>
    apiClient.post<AdjustmentResponse>(`/adjustments/${id}/cancel`).then((r) => r.data),
};
