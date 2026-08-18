import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";

export const usePartners = () => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // Fetch partners list
  const {
    data: partners = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.partners.list(),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `https://menu4.xyz/v2/admin/listview_partner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    },
    enabled: !!adminData?.user_id,
  });

  // Delete partner mutation
  const deleteMutation = useMutation({
    mutationFn: async (partnerId) => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await axios.delete('https://menu4.xyz/v2/admin/delete_partner', {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: {
          partner_id: partnerId,
          user_id: adminData.user_id,
          app_source: "admin",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.partners.list());
      toastController.success("Partner deleted successfully");
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail || "Failed to delete partner"
      );
    },
  });

  // Bulk action mutation
  const bulkAction = useMutation({
    mutationFn: async (payload) => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        'https://menu4.xyz/v2/common/bulk_partner_action',
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.partners.list());
      refetch();
      toastController.success("Bulk action completed successfully");
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail || "Failed to process bulk action"
      );
    },
  });

  // Calculate counts
  const counts = {
    total: partners.length,
    active: partners.filter((partner) => partner.is_active === 1).length,
    inactive: partners.filter((partner) => partner.is_active === 0).length,
  };

  return {
    partners,
    isLoading,
    error,
    refetch,
    deleteMutation,
    bulkAction,
    isBulkActioning: bulkAction.isLoading,
    bulkActionError: bulkAction.error,
    counts,
  };
};
