import apiClient from "./apiClient";

export interface WarehouseCreate {
  name: string;
  address?: string;
}

export interface WarehouseUpdate {
  name?: string;
  address?: string;
}

export interface WarehouseResponse {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LocationCreate {
  name: string;
  warehouse_id: string;
  zone?: string;
}

export interface LocationUpdate {
  name?: string;
  zone?: string;
}

export interface LocationResponse {
  id: string;
  name: string;
  warehouse_id: string;
  warehouse_name: string | null;
  zone: string | null;
  is_active: boolean;
  created_at: string;
}

export const warehouseService = {
  getWarehouses: () =>
    apiClient.get<WarehouseResponse[]>("/warehouses").then((r) => r.data),

  getWarehouse: (id: string) =>
    apiClient.get<WarehouseResponse>(`/warehouses/${id}`).then((r) => r.data),

  createWarehouse: (data: WarehouseCreate) =>
    apiClient.post<WarehouseResponse>("/warehouses", data).then((r) => r.data),

  updateWarehouse: (id: string, data: WarehouseUpdate) =>
    apiClient.put<WarehouseResponse>(`/warehouses/${id}`, data).then((r) => r.data),

  deleteWarehouse: (id: string) =>
    apiClient.delete<WarehouseResponse>(`/warehouses/${id}`).then((r) => r.data),

  // Locations
  getLocations: (warehouse_id?: string) =>
    apiClient.get<LocationResponse[]>("/locations", { params: warehouse_id ? { warehouse_id } : {} }).then((r) => r.data),

  getLocation: (id: string) =>
    apiClient.get<LocationResponse>(`/locations/${id}`).then((r) => r.data),

  createLocation: (data: LocationCreate) =>
    apiClient.post<LocationResponse>("/locations", data).then((r) => r.data),

  updateLocation: (id: string, data: LocationUpdate) =>
    apiClient.put<LocationResponse>(`/locations/${id}`, data).then((r) => r.data),

  deleteLocation: (id: string) =>
    apiClient.delete<LocationResponse>(`/locations/${id}`).then((r) => r.data),
};
