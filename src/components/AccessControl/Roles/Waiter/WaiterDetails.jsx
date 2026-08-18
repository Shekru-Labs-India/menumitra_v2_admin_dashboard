import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { API_CONFIG } from "../../../../config/appConfig";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../../Breadcrumb";
import DeleteConfirmModal from "../../../common/DeleteConfirmModal/DeleteConfirmModal";
import { toastController } from "../../../../utils/toastController";
import { queryKeys } from "../../../../lib/react-query/queryKeys";

const { BASE_URL, API_VERSION } = API_CONFIG;

function WaiterDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState(null);

  // Fetch waiter details query
  const {
    data: waiterResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.waiters.details(outletId, userId),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/waiter_view`,
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      return response.data;
    },
    enabled:
      Boolean(adminData?.user_id) && Boolean(outletId) && Boolean(userId),
  });

  // Delete waiter mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/waiter_delete`, {
        data: {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app",
        },
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toastController.success("Waiter deleted successfully");
      queryClient.invalidateQueries(queryKeys.waiters.list(outletId));
      navigate(`/view-outlet/${outletId}`);
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.msg || "Failed to delete waiter"
      );
    },
  });

  // Update waiter mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      return axios.put(
        `${BASE_URL}/${API_VERSION}/common/waiter_update`,
        {
          ...updatedData,
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      // Invalidate waiter details and list queries to refresh data
      queryClient.invalidateQueries(
        queryKeys.waiters.details(outletId, userId)
      );
      queryClient.invalidateQueries(queryKeys.waiters.list(outletId));
      // Optionally, show a toast or perform other actions
      toastController.success("Waiter updated successfully");
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.msg || "Failed to update waiter"
      );
    },
  });

  // Function to call for updating waiter details
  const handleUpdate = (updatedData) => {
    updateMutation.mutate(updatedData);
  };

  // Memoized values
  const waiterData = React.useMemo(
    () => waiterResponse?.data || null,
    [waiterResponse]
  );

  const outletName = React.useMemo(
    () => waiterData?.outlet_name || "",
    [waiterData]
  );

  React.useEffect(() => {
    setActiveSessions(waiterData?.active_sessions || []);
  }, [waiterData?.active_sessions]);

  const handleLogout = async (device_id) => {
    const session = activeSessions.find((s) => s.device_id === device_id);
    if (!session) return;
    try {
      const res = await fetch("https://menu4.xyz/v2/admin/admin_logout_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify({
          admin_id: adminData?.user_id,
          user_id: waiterData.user_id,
          app_type: session.app_type,
          device_id: session.device_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSessions((prev) =>
          prev.filter((s) => s.device_id !== device_id)
        );
        if (window.toastController) {
          window.toastController.success("Logout successful");
        } else {
          alert("Logout successful");
        }
      } else {
        if (window.toastController) {
          window.toastController.error(data.detail || "Logout failed");
        } else {
          alert(data.detail || "Logout failed");
        }
      }
    } catch (err) {
      if (window.toastController) {
        window.toastController.error("Logout failed");
      } else {
        alert("Logout failed");
      }
    }
  };

  // Memoized breadcrumb items
  const breadcrumbItems = React.useMemo(
    () => [
      { label: "Home", path: "/Home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Waiters", path: `/waiters/${outletId}` },
      { label: "Waiter Details" },
    ],
    [outletName, outletId]
  );

  // Memoized handlers
  const handleDelete = React.useCallback(() => {
    deleteMutation.mutate();
    setShowDeleteModal(false);
  }, [deleteMutation]);

  // Memoized render functions
  const renderWaiterDetails = React.useCallback(() => {
    if (!waiterData) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {waiterData?.name && (
          <div>
            <p className="text-gray-900">{waiterData.name}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
          </div>
        )}
        {waiterData?.mobile && (
          <div>
            <p className="text-gray-900">{waiterData.mobile}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile
            </label>
          </div>
        )}
        {waiterData?.email && (
          <div>
            <p className="text-gray-900">{waiterData.email}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
          </div>
        )}
        {waiterData?.aadhar_number && (
          <div>
            <p className="text-gray-900">{waiterData.aadhar_number}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar Number
            </label>
          </div>
        )}
        {waiterData?.dob && (
          <div>
            <p className="text-gray-900">{waiterData.dob}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
          </div>
        )}
        {waiterData?.address && (
          <div>
            <p className="text-gray-900">{waiterData.address}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
          </div>
        )}
        {waiterData?.is_active !== null &&
          waiterData?.is_active !== undefined && (
            <div>
              <p
                className={`text-gray-900 ${
                  waiterData.is_active === 1
                    ? "text-success-600"
                    : "text-error-600"
                }`}
              >
                {waiterData.is_active === 1 ? "Active" : "Inactive"}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
            </div>
          )}
        {waiterData?.created_by && (
          <div>
            <p className="text-gray-900">{waiterData.created_by}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
          </div>
        )}
        {waiterData?.created_on && (
          <div>
            <p className="text-gray-900">{waiterData.created_on}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created On
            </label>
          </div>
        )}
        {waiterData?.updated_by && (
          <div>
            <p className="text-gray-900">{waiterData.updated_by}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated By
            </label>
          </div>
        )}
        {waiterData?.updated_on && (
          <div>
            <p className="text-gray-900">{waiterData.updated_on}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated On
            </label>
          </div>
        )}
      </div>
    );
  }, [waiterData]);

  const renderFunctionalities = React.useCallback(() => {
    if (!waiterData?.functionalities?.length) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Functionalities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {waiterData.functionalities.map((func) => (
            <div
              key={func.functionality_id}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-700">{func.functionality_name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }, [waiterData]);

  // Update renderActiveSessions to use activeSessions and add Logout button
  const renderActiveSessions = React.useCallback(() => {
    if (!activeSessions || activeSessions.length === 0) return null;
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Active Sessions
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                  Device ID
                </th>
                <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                  Device Model
                </th>
                <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                  App Type
                </th>
                <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                  Last Activity
                </th>
                <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                  Last Login
                </th>
                <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {session.device_id || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {session.device_model || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {session.app_type || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {session.last_activity || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {session.last_login || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    <button
                      className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                      onClick={() => handleLogout(session.device_id)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [activeSessions, handleLogout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-brand-500">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error-500 text-center p-4">
        {error.response?.data?.msg || "Failed to fetch waiter details"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Waiter Details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-waiter/${outletId}/${userId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {renderWaiterDetails()}
          {renderActiveSessions()}
          {renderFunctionalities()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default WaiterDetails;
