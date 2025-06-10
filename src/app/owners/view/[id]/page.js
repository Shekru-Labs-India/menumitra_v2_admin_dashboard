"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCreditCard, // <-- Added FiCalendar import
  FiEye,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiShield,
  FiCheck,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";
import ownerService from "@/api/services/ownerService";
import tokenService from "@/services/tokenService";
import { isAuthenticated } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumb";

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default function ViewOwnerPage({ params }) {
  // Unwrap params with React.use()
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }

    fetchOwnerDetails();
  }, [router, id]);

  const fetchOwnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerDetails = await ownerService.viewOwner(id);

      if (ownerDetails.detail && typeof ownerDetails.detail === "string") {
        // This is an error response from the API
        setError(ownerDetails.detail);
        setLoading(false);
        return;
      }

      setOwner(ownerDetails);
    } catch (error) {
      console.error("Failed to fetch owner details:", error);
      setError(error.detail || error.message || "Failed to load owner details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/owners/edit/${id}`);
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;

      const response = await ownerService.deleteOwner(id, userId);

      if (response.detail) {
        if (response.detail.includes("successfully")) {
          toast.success(response.detail);
          router.push("/owners");
        } else {
          setError(response.detail);
          setShowDeleteModal(false);
        }
      } else {
        toast.success("Owner deleted successfully");
        router.push("/owners");
      }
    } catch (error) {
      console.error("Failed to delete owner:", error);
      setError(error.detail || error.message || "Failed to delete owner");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const goBack = () => {
    router.push("/owners");
  };

  // Define the details arrays when owner data is available
  const personalDetails = owner
    ? [
        { icon: FiUser, label: "Name", value: owner.name },
        { icon: FiMail, label: "Email", value: owner.email },
        { icon: FiPhone, label: "Mobile", value: owner.mobile },
        { icon: FiMapPin, label: "Address", value: owner.address },
        {
          icon: FiCalendar,
          label: "Date of Birth",
          value: formatDate(owner.dob),
        },
        {
          icon: FiCreditCard,
          label: "Aadhar Number",
          value: owner.aadhar_number,
        },
      ]
    : [];

  const accountDetails = owner
    ? [
        { icon: FiShield, label: "Role", value: owner.role },
        {
          icon: FiCheck,
          label: "Account Status",
          value: owner.account_status ? "Active" : "Inactive",
          status: owner.account_status ? "active" : "inactive",
        },
        {
          icon: FiCheck,
          label: "Active Status",
          value: owner.is_active ? "Active" : "Inactive",
          status: owner.is_active ? "active" : "inactive",
        },
        {
          icon: FiCheck,
          label: "Staff Status",
          value: owner.is_staff ? "Yes" : "No",
          status: owner.is_staff ? "active" : "inactive",
        },
        {
          icon: FiCheck,
          label: "Superuser Status",
          value: owner.is_superuser ? "Yes" : "No",
          status: owner.is_superuser ? "active" : "inactive",
        },
        {
          icon: FiClock,
          label: "Created On",
          value: formatDate(owner.created_on) || "-",
        },
        {
          icon: FiUser,
          label: "Created By",
          value: owner.created_by || "-",
        },
        ...(owner.updated_on
          ? [
              {
                icon: FiClock,
                label: "Updated On",
                value: formatDate(owner.updated_on),
              },
              {
                icon: FiUser,
                label: "Updated By",
                value: owner.updated_by || "-",
              },
            ]
          : []),
      ]
    : [];

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <Breadcrumb />
        {/* Loading indicator */}
      </div>
    );
  }

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-0">
        <Breadcrumb />
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden -mt-5 ">
        {/* Header with back, title and action buttons */}
        <div className="px-4 py-3  border-gray-200 flex items-center justify-between relative">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-1" size={12} />
            Back
          </button>

          {/* Centered heading */}
          <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            Owner Details
          </h1>

          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/owners/edit/${id}`)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-orange-500 hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-900 transition-colors"
            >
              <FiEdit className="mr-1.5" size={12} />
              Edit
            </button>
            <button
              onClick={confirmDelete}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <FiTrash2 className="mr-1.5" size={12} />
              Delete
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-3">
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={14} />
              <span className="text-xs">{error}</span>
            </div>
          </div>
        )}

        {/* Content area */}
        {!error && owner && (
          <div className="p-4">
            {/* Owner details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-medium text-gray-700 mb-3">
                  Personal Information
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {personalDetails.map((detail, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-md flex items-start"
                    >
                      <div className="mr-3 mt-0.5 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <detail.icon className="text-gray-500 h-3.5 w-3.5" />
                      </div>
                      <div>
                        <dd className="text-xs font-medium text-gray-900">
                          {detail.value}
                        </dd>
                        <dt className="mt-0.5 text-xs font-medium text-gray-500">
                          {detail.label}
                        </dt>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-medium text-gray-700 mb-3">
                  Account Information
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accountDetails.map((detail, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-md flex items-start"
                    >
                      <div className="mr-3 mt-0.5 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <detail.icon className="text-gray-500 h-3.5 w-3.5" />
                      </div>
                      <div>
                        {detail.status ? (
                          <dd className="mt-0.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                detail.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {detail.value}
                            </span>
                          </dd>
                        ) : (
                          <dd className="text-xs font-medium text-gray-900">
                            {detail.value}
                          </dd>
                        )}
                        <dt className="mt-0.5 text-xs font-medium text-gray-500">
                          {detail.label}
                        </dt>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Outlets Section */}
            {owner.outlets && owner.outlets.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-medium text-gray-700 mb-3">
                  Outlets
                </h3>
                <div className="bg-white rounded-lg">
                  <ul className="divide-y divide-gray-100">
                    {owner.outlets.map((outlet, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-gray-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {outlet.name}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            outlet.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {outlet.is_active ? "Active" : "Inactive"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FiAlertCircle className="text-red-500 mr-2" size={20} />
              Confirm Deletion
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to delete this owner? This action cannot be
              undone. All data associated with this owner will be permanently
              removed.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:bg-red-300"
              >
                {loading ? "Deleting..." : "Delete Owner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
