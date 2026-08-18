import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSpinner,
  faPen as faEdit,
  faTrash,
  
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../../Breadcrumb";
import { toastController } from "../../../../utils/toastController";
import DeleteConfirmModal from "../../../common/DeleteConfirmModal/DeleteConfirmModal";
import { API_CONFIG } from "../../../../config/appConfig";
import { queryKeys } from "../../../../lib/react-query/queryKeys";

function ChefDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Fetch chef details query
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.chefs.detail(outletId, userId),
    queryFn: async () => {
      const token = getToken();
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/chef_view`,
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return response.data;
    },
    enabled:
      Boolean(adminData?.user_id) && Boolean(outletId) && Boolean(userId),
  });

  // Delete chef mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/chef_delete`, {
        data: {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app",
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toastController.success("Chef deleted successfully");
      queryClient.invalidateQueries(queryKeys.chefs.all);
      navigate(`/view-outlet/${outletId}`);
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.msg || "Failed to delete chef"
      );
    },
  });

  // Memoized values
  const chefData = React.useMemo(() => response?.detail || null, [response]);
  const outletName = React.useMemo(
    () => chefData?.outlet_name || "",
    [chefData]
  );

  // Memoized breadcrumb items
  const breadcrumbItems = React.useMemo(
    () => [
      { label: "Home", path: "/Home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Chefs", path: `/chefs/${outletId}` },
      { label: "Chef Details" },
    ],
    [outletName, outletId]
  );

  // Memoized handlers
  const handleDelete = React.useCallback(() => {
    deleteMutation.mutate();
  }, [deleteMutation]);

  const handleEdit = React.useCallback(() => {
    navigate(`/edit-chef/${outletId}/${userId}`);
  }, [navigate, outletId, userId]);

  const handleBack = React.useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const [activeSessions, setActiveSessions] = React.useState(
    chefData?.active_sessions || []
  );
  React.useEffect(() => {
    setActiveSessions(chefData?.active_sessions || []);
  }, [chefData?.active_sessions]);
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
          user_id: chefData.user_id,
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

  // Add this render function for active sessions
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
  }, [activeSessions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-brand-500">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8" />
        </div>
      </div>
    );
  }

  const renderChefDetails = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {chefData?.name && (
          <div>
            <p className="text-gray-900">{chefData.name}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
          </div>
        )}
        {chefData?.mobile && (
          <div>
            <p className="text-gray-900">{chefData.mobile}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile
            </label>
          </div>
        )}
        {chefData?.email && (
          <div>
            <p className="text-gray-900">{chefData.email}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
          </div>
        )}
        {chefData?.aadhar_number && (
          <div>
            <p className="text-gray-900">{chefData.aadhar_number}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar Number
            </label>
          </div>
        )}
        {chefData?.dob && (
          <div>
            <p className="text-gray-900">{chefData.dob}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
          </div>
        )}
        {chefData?.address && (
          <div>
            <p className="text-gray-900">{chefData.address}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
          </div>
        )}
        {chefData?.is_active !== null && chefData?.is_active !== undefined && (
          <div>
            <p
              className={`text-gray-900 ${
                chefData.is_active === 1 ? "text-success-600" : "text-error-600"
              }`}
            >
              {chefData.is_active === 1 ? "Active" : "Inactive"}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
          </div>
        )}
        {chefData?.created_by && (
          <div>
            <p className="text-gray-900">{chefData.created_by}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
          </div>
        )}
        {chefData?.created_on && (
          <div>
            <p className="text-gray-900">{chefData.created_on}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created On
            </label>
          </div>
        )}
        {chefData?.updated_by && (
          <div>
            <p className="text-gray-900">{chefData.updated_by}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated By
            </label>
          </div>
        )}
        {chefData?.updated_on && (
          <div>
            <p className="text-gray-900">{chefData.updated_on}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated On
            </label>
          </div>
        )}
      </div>
    );
  };

  const renderFunctionalities = () => {
    if (!chefData?.functionalities?.length) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Functionalities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {chefData.functionalities.map((func) => (
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Chef Details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
              >
                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {error ? (
            <div className="text-error-500 text-center">
              {error.response?.data?.msg || "Failed to fetch chef details"}
            </div>
          ) : (
            <>
              {renderChefDetails()}
              {renderFunctionalities()}
              {renderActiveSessions()}
            </>
          )}
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

export default ChefDetails;
