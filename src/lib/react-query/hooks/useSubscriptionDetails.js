import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { queryKeys } from '../queryKeys';
import { toastController } from '../../../utils/toastController';

export const useSubscriptionDetails = (subscriptionId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // Subscription details query
  const {
    data: subscriptionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.subscriptions.detail(subscriptionId),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No authentication token available');

      const response = await toastController.promise(
        axios.post(
          'https://menu4.xyz/v2/admin/view_subscription',
          {
            subscription_id: Number(subscriptionId),
            user_id: adminData.user_id,
            app_source: 'admin_app'
          },
          {
            headers: {
              Authorization: token
            }
          }
        ),
        {
          loading: 'Loading subscription details...',
          success: 'Subscription details loaded successfully!',
          error: 'Failed to load subscription details'
        }
      );

      return response.data.data;
    },
    enabled: Boolean(subscriptionId && adminData?.user_id),
    meta: {
      cacheStrategy: 'post-cache', // Handle POST request caching
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No authentication token available');

      const response = await toastController.promise(
        axios.post(
          'https://menu4.xyz/v2/admin/delete_subscription',
          {
            subscription_id: Number(subscriptionId),
            user_id: adminData.user_id,
            app_source: 'admin_app',
          },
          {
            headers: {
              Authorization: token,
            },
          }
        ),
        {
          loading: 'Deleting subscription...',
          success: 'Subscription deleted successfully!',
          error: 'Failed to delete subscription',
        }
      );

      if (response.data.detail !== 'Subscription deleted successfully') {
        throw new Error(response.data.detail || 'Failed to delete subscription');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.detail(subscriptionId) });
    },
  });

  return {
    subscription: subscriptionData,
    isLoading,
    error,
    deleteSubscription: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
}; 