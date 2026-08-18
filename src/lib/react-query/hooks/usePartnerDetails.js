import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { queryKeys } from "../queryKeys";
import { toastController } from "../../../utils/toastController";

export const usePartnerDetails = (partnerId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // Partner details query
  const {
    data: partnerData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.partners.detail(partnerId),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        'https://menu4.xyz/v2/admin/view_partner',
        {
          partner_id: Number(partnerId),
          user_id: adminData.user_id,
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    },
    enabled: Boolean(partnerId && adminData?.user_id),
    meta: {
      cacheStrategy: "post-cache", // Handle POST request caching
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      await toastController.promise(
        axios.delete('https://menu4.xyz/v2/admin/delete_partner', {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          data: {
            partner_id: Number(partnerId),
            user_id: adminData.user_id,
            app_source: "admin",
          },
        }),
        {
          loading: "Deleting partner...",
          success: "Partner deleted successfully!",
          error: "Failed to delete partner",
        }
      );
    },
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.detail(partnerId),
      });
    },
  });

  return {
    partner: partnerData,
    isLoading,
    error,
    refetch,
    deletePartner: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
