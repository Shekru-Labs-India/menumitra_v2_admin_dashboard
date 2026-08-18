import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { queryKeys } from '../queryKeys';
import { toastController } from '../../../utils/toastController';

export const useSuperOwnerDetails = (superOwnerId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // Super owner details query
  const {
    data: superOwnerData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.superOwners.detail(superOwnerId),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        'https://menu4.xyz/v2/admin/view_super_owner',
        {
          user_id: adminData.user_id,
          super_owner_id: parseInt(superOwnerId),
          app_source: 'admin_app'
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Return the raw response data to match OwnerDetails pattern
      return response.data;
    },
    enabled: Boolean(superOwnerId && adminData?.user_id),
    // Let it use the global defaults from queryClient.js
    meta: {
      cacheStrategy: 'post-cache', // Only add this to handle POST request caching
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      await toastController.promise(
        axios.delete('https://menu4.xyz/v2/admin/delete_super_owner', {
          data: {
            user_id: adminData.user_id,
            super_owner_id: parseInt(superOwnerId),
            app_source: 'admin_app'
          },
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: 'Deleting super owner...',
          success: 'Super owner deleted successfully!',
          error: 'Failed to delete super owner'
        }
      );
    },
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: queryKeys.superOwners.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.superOwners.detail(superOwnerId) });
    },
  });

  // Extract the needed data from the response to match the component's expectations
  const superOwnerDetails = superOwnerData ? {
    superOwnerData: superOwnerData.super_owner,
    assignedOutlets: superOwnerData.assigned_outlets || [],
    assignedFunctionalities: superOwnerData.assigned_functionalities || [],
    totalOutlets: superOwnerData.total_outlets || 0,
    totalFunctionalities: superOwnerData.total_functionalities || 0
  } : null;

  return {
    superOwnerDetails,
    isLoading,
    error,
    deleteSuperOwner: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}; 