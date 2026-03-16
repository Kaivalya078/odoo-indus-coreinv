import apiClient from "./apiClient";

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
  unit: string;
  min_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  unit?: string;
  min_stock?: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category_id?: string;
  unit?: string;
  min_stock?: number;
}

export const productService = {
  getProducts: (params?: { skip?: number; limit?: number; search?: string; category_id?: string }) =>
    apiClient.get<ProductResponse[]>("/products", { params }).then((r) => r.data),

  getProduct: (id: string) =>
    apiClient.get<ProductResponse>(`/products/${id}`).then((r) => r.data),

  createProduct: (data: ProductCreate) =>
    apiClient.post<ProductResponse>("/products", data).then((r) => r.data),

  updateProduct: (id: string, data: ProductUpdate) =>
    apiClient.put<ProductResponse>(`/products/${id}`, data).then((r) => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete<ProductResponse>(`/products/${id}`).then((r) => r.data),
};
