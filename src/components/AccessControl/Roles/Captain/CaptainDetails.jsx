import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
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
import { API_CONFIG } from "../../../../config/appConfig";
import { queryKeys } from "../../../../lib/react-query/queryKeys";

function CaptainDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState(null);

  // Fetch captain details query
  const {
    data: captainResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.captains.details(outletId, userId),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/captain_view`,
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

  // Delete captain mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/captain_delete`, {
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
      toastController.success("Captain deleted successfully");
      queryClient.invalidateQueries(queryKeys.captains.list(outletId));
      navigate(`/view-outlet/${outletId}`);
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.msg || "Failed to delete captain"
      );
    },
  });

  // Memoized values
  const captainData = React.useMemo(
    () => captainResponse?.data || null,
    [captainResponse]
  );

  const outletName = React.useMemo(
    () => captainData?.outlet_name || "",
    [captainData]
  );

  React.useEffect(() => {
    setActiveSessions(captainData?.active_sessions || []);
  }, [captainData?.active_sessions]);

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
          user_id: captainData.user_id,
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
      { label: "Captains", path: `/captains/${outletId}` },
      { label: "Captain Details" },
    ],
    [outletName, outletId]
  );

  // Memoized handlers
  const handleDelete = React.useCallback(() => {
    deleteMutation.mutate();
    setShowDeleteModal(false);
  }, [deleteMutation]);

  // Memoized render functions
  const renderCaptainDetails = React.useCallback(() => {
    if (!captainData) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {captainData?.name && (
          <div>
            <p className="text-gray-900">{captainData.name}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
          </div>
        )}
        {captainData?.mobile && (
          <div>
            <p className="text-gray-900">{captainData.mobile}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile
            </label>
          </div>
        )}
        {captainData?.email && (
          <div>
            <p className="text-gray-900">{captainData.email}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
          </div>
        )}
        {captainData?.aadhar_number && (
          <div>
            <p className="text-gray-900">{captainData.aadhar_number}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar Number
            </label>
          </div>
        )}
        {captainData?.dob && (
          <div>
            <p className="text-gray-900">{captainData.dob}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
          </div>
        )}
        {captainData?.address && (
          <div>
            <p className="text-gray-900">{captainData.address}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
          </div>
        )}
        {captainData?.is_active !== null &&
          captainData?.is_active !== undefined && (
            <div>
              <p
                className={`text-gray-900 ${
                  captainData.is_active === 1
                    ? "text-success-600"
                    : "text-error-600"
                }`}
              >
                {captainData.is_active === 1 ? "Active" : "Inactive"}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
            </div>
          )}
        {captainData?.created_by && (
          <div>
            <p className="text-gray-900">{captainData.created_by}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
          </div>
        )}
        {captainData?.created_on && (
          <div>
            <p className="text-gray-900">{captainData.created_on}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created On
            </label>
          </div>
        )}
        {captainData?.updated_by && (
          <div>
            <p className="text-gray-900">{captainData.updated_by}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated By
            </label>
          </div>
        )}
        {captainData?.updated_on && (
          <div>
            <p className="text-gray-900">{captainData.updated_on}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated On
            </label>
          </div>
        )}
      </div>
    );
  }, [captainData]);

  const renderFunctionalities = React.useCallback(() => {
    if (!captainData?.functionalities?.length) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Functionalities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {captainData.functionalities.map((func) => (
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
  }, [captainData]);

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
        {error.response?.data?.msg || "Failed to fetch captain details"}
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
              Captain Details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-captain/${outletId}/${userId}`)}
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
          {renderCaptainDetails()}
          {renderFunctionalities()}
          {renderActiveSessions()}
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

export default CaptainDetails;
