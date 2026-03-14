import apiClient from "./apiClient";

export interface DashboardStats {
  total_products: number;
  total_warehouses: number;
  total_suppliers: number;
  pending_receipts: number;
  pending_deliveries: number;
  pending_transfers: number;
  low_stock_count: number;
}

export interface LowStockItem {
  product_name: string;
  product_sku: string;
  location_name: string;
  warehouse_name: string;
  current_stock: number;
  min_stock: number;
  unit: string;
}

export interface WarehouseSummary {
  warehouse_name: string;
  total_products: number;
  total_stock: number;
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

export const dashboardService = {
  getStats: () =>
    apiClient.get<DashboardStats>("/dashboard/stats").then((r) => r.data),

  getRecentMoves: () =>
    apiClient.get<StockMoveResponse[]>("/dashboard/recent-moves").then((r) => r.data),

  getLowStock: () =>
    apiClient.get<LowStockItem[]>("/dashboard/low-stock").then((r) => r.data),

  getWarehouseSummary: () =>
    apiClient.get<WarehouseSummary[]>("/dashboard/warehouse-summary").then((r) => r.data),
};
