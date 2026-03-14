import apiClient from "./apiClient";

export interface ReceiptItemCreate {
  product_id: string;
  location_id: string;
  quantity: number;
}

export interface ReceiptCreate {
  supplier_id?: string;
  warehouse_id: string;
  notes?: string;
  scheduled_date?: string;
  source_document?: string;
  items: ReceiptItemCreate[];
}

export interface ReceiptUpdate {
  supplier_id?: string;
  notes?: string;
  scheduled_date?: string;
  source_document?: string;
  items?: ReceiptItemCreate[];
}

export interface ReceiptItemResponse {
  id: string;
  product_id: string;
  product_name: string | null;
  location_id: string;
  location_name: string | null;
  quantity: number;
  created_at: string;
}

export interface ReceiptResponse {
  id: string;
  reference: string;
  supplier_id: string | null;
  supplier_name: string | null;
  warehouse_id: string;
  warehouse_name: string | null;
  status: string;
  notes: string | null;
  scheduled_date: string | null;
  source_document: string | null;
  created_by: string;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  items: ReceiptItemResponse[];
}

export const receiptService = {
  getReceipts: (status?: string) =>
    apiClient.get<ReceiptResponse[]>("/receipts", { params: status ? { status } : {} }).then((r) => r.data),

  getReceipt: (id: string) =>
    apiClient.get<ReceiptResponse>(`/receipts/${id}`).then((r) => r.data),

  createReceipt: (data: ReceiptCreate) =>
    apiClient.post<ReceiptResponse>("/receipts", data).then((r) => r.data),

  updateReceipt: (id: string, data: ReceiptUpdate) =>
    apiClient.put<ReceiptResponse>(`/receipts/${id}`, data).then((r) => r.data),

  validateReceipt: (id: string) =>
    apiClient.post<ReceiptResponse>(`/receipts/${id}/validate`).then((r) => r.data),

  confirmReceipt: (id: string) =>
    apiClient.post<ReceiptResponse>(`/receipts/${id}/done`).then((r) => r.data),

  cancelReceipt: (id: string) =>
    apiClient.post<ReceiptResponse>(`/receipts/${id}/cancel`).then((r) => r.data),
};
