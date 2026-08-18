import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "../queryKeys";

export const useCategories = (outletId, userId) => {
  const queryClient = useQueryClient();

  // Fetch categories query
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(outletId),
    queryFn: async () => {
      const token = localStorage.getItem("token"); // Or use your auth method
      const response = await axios.post(
        "https://menu4.xyz/v2/common/menu_category_list",
        {
          outlet_id: Number(outletId),
          user_id: userId,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    },
    enabled: Boolean(outletId && userId),
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, outletId, userId }) => {
      const token = localStorage.getItem('token');
      return axios.delete('https://menu4.xyz/v2/common/menu_category_delete', {
        data: {
          menu_cat_id: categoryId,
          outlet_id: outletId,
          user_id: userId,
          app_source: "admin_app",
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.list(outletId),
      });
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds, outletId, userId }) => {
      const token = localStorage.getItem("token");
      return axios.post(
        'https://menu4.xyz/v2/common/bulk_category_action',
        {
          user_id: userId,
          outlet_id: Number(outletId),
          action: action,
          app_source: "admin_app",
          menu_cat_ids: selectedIds,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.list(outletId),
      });
    },
  });

  return {
    categoriesQuery,
    deleteCategoryMutation,
    bulkActionMutation,
  };
};
