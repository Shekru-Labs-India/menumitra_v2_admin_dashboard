import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_CONFIG } from '../../../config/appConfig';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { queryKeys } from '../queryKeys';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useSuperOwners = () => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // List query
  const {
    data: superOwners = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.superOwners.list(),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        'https://menu4.xyz/v2/admin/listview_super_owner',
        { 
          user_id: adminData.user_id,
          app_source: 'admin_app'
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.super_owners || [];
    },
    enabled: Boolean(adminData?.user_id),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (superOwnerId) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      await toastController.promise(
        axios.delete('https://menu4.xyz/v2/admin/delete_super_owner', {
          data: {
            super_owner_id: parseInt(superOwnerId),
            user_id: adminData.user_id,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.superOwners.all });
    },
  });

  const bulkAction = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        'https://menu4.xyz/v2/common/bulk_super_owner_action',
        payload,
        {
          headers: {
            Authorization: getToken()
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch to get latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.superOwners.list() });
      refetch(); // Explicitly refetch to ensure we have latest data
    }
  });

  return {
    superOwners,
    isLoading,
    error,
    refetch,
    deleteMutation,
    bulkAction,
    isBulkActioning: bulkAction.isLoading,
    bulkActionError: bulkAction.error
  };
}; 