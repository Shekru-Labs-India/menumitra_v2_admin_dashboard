import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faUser,
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faIdCard,
  faLocationDot,
  faUserTag,
  faUserCheck,
  faCalendarPlus,
  faCalendarCheck,
  faCircleCheck,
  faCircleXmark,
  faStore,
  faChevronRight,
  faTrash,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import ActiveSessionsTable from "../common/ActiveSessionsTable";
import { useSuperOwnerDetails } from "../../lib/react-query/hooks/useSuperOwnerDetails";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";

function SuperOwnerDetails() {
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const { superOwnerId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    superOwnerDetails,
    isLoading,
    error,
    deleteSuperOwner,
    isDeleting,
    refetch,
  } = useSuperOwnerDetails(superOwnerId);

  // Local state for active sessions - moved to top to avoid conditional hooks
  const [activeSessions, setActiveSessions] = useState([]);

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Super Owners", path: "/super-owners" },

    {
      label: "Super Owner Details",
      path: `/super-owner-details/${superOwnerId}`,
    },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    await deleteSuperOwner();
    setIsModalOpen(false);
    navigate("/super-owners");
  };

  // Update active sessions when superOwnerData changes
  useEffect(() => {
    if (superOwnerDetails?.assignedOutlets) {
      // Flatten all active sessions from all outlets

      const allSessions = superOwnerDetails.assignedOutlets.flatMap(
        (outlet) => outlet.active_sessions || []
      );
      setActiveSessions(allSessions);
    }
  }, [superOwnerDetails?.assignedOutlets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-error-500">
          Error loading super owner details
        </div>
      </div>
    );
  }

  if (!superOwnerDetails?.superOwnerData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          No super owner data found
        </div>
      </div>
    );
  }

  const {
    superOwnerData,
    assignedOutlets,
    assignedFunctionalities,
    totalOutlets,
    totalFunctionalities,
  } = superOwnerDetails;

  const handleLogout = async (device_id) => {
    // Find the session for this device_id to get app_type
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
          user_id: superOwnerData.super_owner_id,
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
    } catch {
      if (window.toastController) {
        window.toastController.error("Logout failed");
      } else {
        alert("Logout failed");
      }
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section - Matching DataTable.jsx style */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}

            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Super Owner Details
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium transition rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-theme-xs disabled:opacity-60"
                title="Reload"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Reload</span>
              </button>
              <button
                onClick={() =>
                  navigate(`/edit-super-owner/${superOwnerData.super_owner_id}`)
                }
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
                onClick={() => setIsModalOpen(true)}
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

          {/* Content Section */}

          <div className="px-6 py-4">
            {/* Personal Information Card */}
            <h2 className="text-base font-medium mb-4 text-gray-800">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Name */}
              {superOwnerData.name && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.name}
                    </div>
                    <div className="text-sm text-gray-500">Name</div>
                  </div>
                </div>
              )}

              {/* Email */}
              {superOwnerData.email && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>

                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.email}
                    </div>
                    <div className="text-sm text-gray-500">Email</div>
                  </div>
                </div>
              )}

              {/* Mobile */}
              {superOwnerData.mobile && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>

                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.mobile}
                    </div>

                    <div className="text-sm text-gray-500">Mobile</div>
                  </div>
                </div>
              )}

              {/* Date of Birth */}
              {superOwnerData.dob && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBirthdayCake}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.dob}
                    </div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                  </div>
                </div>
              )}

              {/* Aadhar Number */}
              {superOwnerData.aadhar_number && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.aadhar_number}
                    </div>
                    <div className="text-sm text-gray-500">Aadhar Number</div>
                  </div>
                </div>
              )}

              {/* Address */}
              {superOwnerData.address && (
                <div className="mt-3 flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.address}
                    </div>
                    <div className="text-sm text-gray-500">Address</div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Information Card */}
            <h2 className="text-base font-medium mb-4 text-gray-800">
              Account Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Role */}
              {superOwnerData.role && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.role}
                    </div>
                    <div className="text-sm text-gray-500">Role</div>
                  </div>
                </div>
              )}

              {/* Account Type */}
              {superOwnerData.account_type && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.account_type?.toUpperCase()}
                    </div>

                    <div className="text-sm text-gray-500">Account Type</div>
                  </div>
                </div>
              )}

              {/* Account Status */}
              {superOwnerData.is_active !== null &&
                superOwnerData.is_active !== undefined && (
                  <div className="flex items-center p-3 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        className="w-5 h-5 text-gray-400"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="mt-1 flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={
                            superOwnerData.is_active === 1 ||
                            superOwnerData.is_active === true
                              ? faCircleCheck
                              : faCircleXmark
                          }
                          className={`w-5 h-5 ${
                            superOwnerData.is_active === 1 ||
                            superOwnerData.is_active === true
                              ? "text-success-500"
                              : "text-error-500"
                          }`}
                        />
                        <span
                          className={`text-base font-medium ${
                            superOwnerData.is_active === 1 ||
                            superOwnerData.is_active === true
                              ? "text-success-700"
                              : "text-error-700"
                          }`}
                        >
                          {superOwnerData.is_active === 1 ||
                          superOwnerData.is_active === true
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">
                        Account Status
                      </div>
                    </div>
                  </div>
                )}

              {/* Created On */}
              {superOwnerData.created_on && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.created_on || "-"}
                    </div>
                    <div className="text-sm text-gray-500">Created On</div>
                  </div>
                </div>
              )}

              {/* Created By */}
              {superOwnerData.created_by && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.created_by?.toUpperCase() || "-"}
                    </div>
                    <div className="text-sm text-gray-500">Created By</div>
                  </div>
                </div>
              )}

              {/* Updated On */}
              {superOwnerData.updated_on && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>

                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.updated_on}
                    </div>
                    <div className="text-sm text-gray-500">Updated On</div>
                  </div>
                </div>
              )}

              {/* Updated By */}
              {superOwnerData.updated_by && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.updated_by?.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">Updated By</div>
                  </div>
                </div>
              )}
            </div>

            {/* Add new Outlets section */}
            {assignedOutlets && assignedOutlets.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Associated Outlets
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {assignedOutlets.map((outlet) => (
                    <div
                      key={outlet.outlet_id}
                      onClick={() =>
                        navigate(`/view-outlet/${outlet.outlet_id}`)
                      }
                      className="group flex items-center p-4 rounded-xl border border-gray-200 
                        hover:border-brand-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-lg 
                        bg-gray-100 group-hover:bg-brand-50"
                      >
                        <FontAwesomeIcon
                          icon={faStore}
                          className="w-5 h-5 text-gray-600 group-hover:text-brand-500"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div
                          className="text-base font-medium text-gray-900 group-hover:text-brand-600 
                          flex items-center justify-between"
                        >
                          {outlet.outlet_name}
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="w-4 h-4 text-gray-400 group-hover:text-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Sessions Section */}
            {activeSessions && activeSessions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Active Sessions
                </h2>
                <ActiveSessionsTable
                  activeSessions={activeSessions}
                  lastLogin={superOwnerData?.last_login}
                  onLogout={handleLogout}
                  showAction={true}
                />
              </div>
            )}

            {/* Add new Functionalities section */}
            {assignedFunctionalities && assignedFunctionalities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Access Functionalities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {assignedFunctionalities.map((func) => (
                    <div
                      key={func.functionality_id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm
                        bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {func.functionality_name
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DeleteConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default SuperOwnerDetails;
