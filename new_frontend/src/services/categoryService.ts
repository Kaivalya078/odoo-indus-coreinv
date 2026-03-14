import apiClient from "./apiClient";

export interface CategoryCreate {
  name: string;
  description?: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const categoryService = {
  getCategories: () =>
    apiClient.get<CategoryResponse[]>("/categories").then((r) => r.data),

  createCategory: (data: CategoryCreate) =>
    apiClient.post<CategoryResponse>("/categories", data).then((r) => r.data),

  updateCategory: (id: string, data: CategoryUpdate) =>
    apiClient.put<CategoryResponse>(`/categories/${id}`, data).then((r) => r.data),

  deleteCategory: (id: string) =>
    apiClient.delete<CategoryResponse>(`/categories/${id}`).then((r) => r.data),
};
