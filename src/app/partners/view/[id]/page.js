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
  FiCreditCard,
  FiArrowLeft,
  FiEdit,
  FiAlertCircle,
  FiTrash2,
  FiCheck,
  FiClock,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import partnerService from "@/api/services/partnerService";
import tokenService from "@/services/tokenService";
import { isAuthenticated } from "@/utils/auth";
import Modal from "@/components/ui/Modal";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added import
import { ArrowLeft } from "lucide-react";

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Info Item component with label below value
const InfoItem = ({
  icon: Icon,
  label,
  value,
  iconClass = "text-gray-600",
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-center mb-0.5">
      <Icon className={`mr-1.5 ${iconClass}`} size={14} />
      <span className="text-xs font-semibold text-gray-900">
        {value || "-"}
      </span>
    </div>
    <div className="text-xs font-medium text-gray-500 pl-5">{label}</div>
  </div>
);

// Status badge component
const StatusBadge = ({ status, label }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      status
        ? "bg-green-100 text-green-800 border border-green-200"
        : "bg-red-100 text-red-800 border border-red-200"
    }`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
    {label}
  </span>
);

export default function ViewPartnerPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const partnerId = unwrappedParams.id;

  const router = useRouter();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }

    fetchPartnerDetails();
  }, []);

  const fetchPartnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;

      const partnerDetails = await partnerService.viewPartner(
        partnerId,
        userId
      );

      if (
        partnerDetails.detail &&
        typeof partnerDetails.detail === "string" &&
        !partnerDetails.name
      ) {
        // This is an error response from the API
        setError(partnerDetails.detail);
        setLoading(false);
        return;
      }

      setPartner(partnerDetails);
    } catch (error) {
      console.error("Failed to fetch partner details:", error);
      // Set error to the exact API error message if available
      setError(
        error.detail || error.message || "Failed to load partner details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/partners/edit/${partnerId}`);
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;

      const response = await partnerService.deletePartner(partnerId, userId);

      if (response.detail) {
        if (response.detail.includes("successfully")) {
          toast.success(response.detail);
          router.push("/partners");
        } else {
          // Set error to the exact API error message
          setError(response.detail);
          setShowDeleteModal(false);
        }
      } else {
        toast.success("Partner deleted successfully");
        router.push("/partners");
      }
    } catch (error) {
      console.error("Failed to delete partner:", error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || "Failed to delete partner");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const goBack = () => {
    router.push("/partners");
  };

  // Render delete confirmation modal content
  const renderDeleteConfirmation = () => {
    if (!partner) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Confirm Deletion
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete this partner? This action cannot be
            undone. All data associated with this partner will be permanently
            removed.
          </p>
        </div>
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
            {loading ? "Deleting..." : "Delete Partner"}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gray-200 rounded-md mr-6"></div>
              <div className="flex-1">
                <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-60 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <FiAlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {/* <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Partners
          </button> */}
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <FiAlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Partner Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The partner you are looking for could not be found or you don't have
            permission to view it.
          </p>
          {/* <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Partners
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 bg-gray-50 min-h-screen">
      {/* Add Breadcrumb */}
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Partner Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 -mt-5 mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="mr-1.5" size={14} /> Back
            </button>
          </div>
          <div className="w-full text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {partner.name
                ?.split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </h2>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={() => router.push(`/outlets/${params.id}/edit`)}
                className="inline-flex items-center justify-center w-full px-3 py-1 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
              >
                <FiEdit className="mr-1" size={12} />
                Edit
              </button>
              <div className="flex space-x-1.5">
                <StatusBadge status={partner.account_status} label="Active" />
                <StatusBadge status={partner.is_active} label="Open" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Personal Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoItem icon={FiUser} label="Name" value={partner.name} />
            <InfoItem
              icon={FiMail}
              label="Email Address"
              value={partner.email}
            />
            <InfoItem
              icon={FiPhone}
              label="Mobile Number"
              value={partner.mobile}
            />
            <InfoItem icon={FiMapPin} label="Address" value={partner.address} />
            <InfoItem
              icon={FiCalendar}
              label="Date of Birth"
              value={formatDate(partner.dob)}
            />
            <InfoItem
              icon={FiCreditCard}
              label="Aadhar Number"
              value={partner.aadhar_number}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Account Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoItem icon={FiShield} label="Role" value={partner.role} />
            <InfoItem
              icon={partner.account_status ? FiCheckCircle : FiXCircle}
              label="Account Status"
              value={partner.account_status ? "Active" : "Inactive"}
              iconClass={
                partner.account_status ? "text-green-600" : "text-red-600"
              }
            />
            <InfoItem
              icon={partner.is_active ? FiCheckCircle : FiXCircle}
              label="Active Status"
              value={partner.is_active ? "Active" : "Inactive"}
              iconClass={partner.is_active ? "text-green-600" : "text-red-600"}
            />
            <InfoItem
              icon={partner.is_staff ? FiCheckCircle : FiXCircle}
              label="Staff Status"
              value={partner.is_staff ? "Yes" : "No"}
              iconClass={partner.is_staff ? "text-green-600" : "text-red-600"}
            />
            <InfoItem
              icon={partner.is_superuser ? FiCheckCircle : FiXCircle}
              label="Superuser Status"
              value={partner.is_superuser ? "Yes" : "No"}
              iconClass={
                partner.is_superuser ? "text-green-600" : "text-red-600"
              }
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Audit Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Audit Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem
              icon={FiCalendar}
              label="Created On"
              value={formatDate(partner.created_on)}
            />
            <InfoItem
              icon={FiUser}
              label="Created By"
              value={partner.created_by || "-"}
            />
            {partner.updated_on && (
              <>
                <InfoItem
                  icon={FiCalendar}
                  label="Updated On"
                  value={formatDate(partner.updated_on)}
                />
                <InfoItem
                  icon={FiUser}
                  label="Updated By"
                  value={partner.updated_by || "-"}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Outlets Section - if partner has outlets */}
      {partner.outlets && partner.outlets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-900 mb-4">
            Managed Outlets
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Outlet Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partner.outlets.map((outlet, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {outlet.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            outlet.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {outlet.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
}
