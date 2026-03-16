import apiClient from "./apiClient";

export interface DeliveryItemCreate {
  product_id: string;
  location_id: string;
  quantity: number;
}

export interface DeliveryCreate {
  customer_name: string;
  warehouse_id: string;
  notes?: string;
  scheduled_date?: string;
  items: DeliveryItemCreate[];
}

export interface DeliveryUpdate {
  customer_name?: string;
  notes?: string;
  scheduled_date?: string;
  items?: DeliveryItemCreate[];
}

export interface DeliveryItemResponse {
  id: string;
  product_id: string;
  product_name: string | null;
  location_id: string;
  location_name: string | null;
  quantity: number;
  created_at: string;
}

export interface DeliveryResponse {
  id: string;
  reference: string;
  customer_name: string;
  warehouse_id: string;
  warehouse_name: string | null;
  status: string;
  notes: string | null;
  scheduled_date: string | null;
  created_by: string;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  items: DeliveryItemResponse[];
}

export const deliveryService = {
  getDeliveries: (status?: string) =>
    apiClient.get<DeliveryResponse[]>("/deliveries", { params: status ? { status } : {} }).then((r) => r.data),

  getDelivery: (id: string) =>
    apiClient.get<DeliveryResponse>(`/deliveries/${id}`).then((r) => r.data),

  createDelivery: (data: DeliveryCreate) =>
    apiClient.post<DeliveryResponse>("/deliveries", data).then((r) => r.data),

  updateDelivery: (id: string, data: DeliveryUpdate) =>
    apiClient.put<DeliveryResponse>(`/deliveries/${id}`, data).then((r) => r.data),

  validateDelivery: (id: string) =>
    apiClient.post<DeliveryResponse>(`/deliveries/${id}/validate`).then((r) => r.data),

  confirmDelivery: (id: string) =>
    apiClient.post<DeliveryResponse>(`/deliveries/${id}/done`).then((r) => r.data),

  cancelDelivery: (id: string) =>
    apiClient.post<DeliveryResponse>(`/deliveries/${id}/cancel`).then((r) => r.data),
};
