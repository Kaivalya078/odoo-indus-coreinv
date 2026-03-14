import apiClient from "./apiClient";

export interface StockLevelResponse {
  product_id: string;
  product_name: string;
  product_sku: string;
  location_id: string;
  location_name: string;
  warehouse_name: string;
  quantity: number;
  unit: string;
  min_stock: number;
}

export interface StockMoveResponse {
  id: string;
  product_id: string;
  product_name: string | null;
  location_id: string;
  location_name: string | null;
  quantity: number;
  reference: string;
  move_type: string;
  created_by: string;
  created_at: string;
}

export const stockService = {
  getStockLevels: (params?: { warehouse_id?: string; product_id?: string }) =>
    apiClient.get<StockLevelResponse[]>("/stock", { params }).then((r) => r.data),

  getStockMoves: (params?: { product_id?: string; location_id?: string; move_type?: string; skip?: number; limit?: number }) =>
    apiClient.get<StockMoveResponse[]>("/stock/moves", { params }).then((r) => r.data),

  getStockByProduct: (productId: string) =>
    apiClient.get<StockLevelResponse[]>(`/stock/product/${productId}`).then((r) => r.data),
};
