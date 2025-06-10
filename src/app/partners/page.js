"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiEye,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiPlus,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import Modal from "@/components/ui/Modal";
import partnerService from "@/api/services/partnerService";
import { isAuthenticated } from "@/utils/auth";
import tokenService from "@/services/tokenService";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added import

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }
  }, [router, mounted]);

  // Fetch partners on component mount
  useEffect(() => {
    if (mounted && isAuthenticated()) {
      fetchPartners();
    }
  }, [mounted]);

  // Fetch partners from API
  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1; // Get userId from auth context

      const data = await partnerService.listPartners(userId);

      if (data.detail && typeof data.detail === "string") {
        // This is likely an error message
        setError(data.detail);
        return;
      }

      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      setError(error.message || "Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to add new partner page
  const handleAddNew = () => {
    router.push("/partners/create");
  };

  // Navigate to edit page for specific partner
  const handleEdit = (partner) => {
    router.push(`/partners/edit/${partner.user_id}`);
  };

  // Navigate to view page for specific partner
  const handleView = (partner) => {
    router.push(`/partners/view/${partner.user_id}`);
  };

  // Show delete confirmation modal
  const confirmDelete = (partner) => {
    setPartnerToDelete(partner);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPartnerToDelete(null);
  };

  // Handle partner deletion
  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1; // Get userId from auth context

      const response = await partnerService.deletePartner(
        partnerToDelete.user_id,
        userId
      );

      if (response.detail && response.detail.includes("successfully")) {
        toast.success("Partner deleted successfully");
        fetchPartners(); // Refresh the list
      } else if (response.detail) {
        setError(response.detail);
        setShowDeleteModal(false);
      } else {
        toast.success("Partner deleted successfully");
        fetchPartners(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete partner:", error);
      setError(error.message || "Failed to delete partner");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setPartnerToDelete(null);
    }
  };

  // Render delete confirmation modal content
  const renderDeleteConfirmation = () => {
    if (!partnerToDelete) return null;

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
            onClick={closeDeleteModal}
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

  // Filter partners based on search query
  const filteredPartners = partners.filter(
    (partner) =>
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.mobile.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredPartners.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredPartners.length / entriesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Change entries per page
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Don't render interactive elements until after hydration
  if (!mounted) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gray-100">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Partner Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage all restaurant partners
            </p>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-md mt-4 sm:mt-0"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white"></div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Partner
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div className="ml-4">
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render skeleton loading directly within the main component
  const renderSkeletonLoaders = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              #
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Partner
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Contact
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-3">
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-start -mb-5">
          <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={14} />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Partner list container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 -mt-5">
        {/* Card header with back, title and create buttons */}
        <div className="px-6 py-4 bg-white flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-1" size={12} />
            Back
          </button>

          {/* Added centered title */}
          <h1 className="text-lg font-semibold text-gray-900">
            Partner Management
          </h1>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-colors duration-200"
          >
            <FiPlus className="mr-1.5" size={12} />
            Create Partner
          </button>
        </div>

        {/* Search and total count section */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div>
              <span className="text-xs font-bold text-black">
                {filteredPartners.length}
              </span>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                TOTAL
              </p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 w-64 text-xs"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading && !error ? (
            renderSkeletonLoaders()
          ) : partners.length === 0 && !error ? (
            <div className="text-center py-8">
              <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xs font-medium text-gray-900">
                No partners found
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Get started by creating a new partner
              </p>
              <button
                onClick={handleAddNew}
                className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
              >
                <FiPlus className="mr-1.5 h-3.5 w-3.5" />
                Add New Partner
              </button>
            </div>
          ) : !error ? (
            <div className="overflow-x-auto">
              {/* Table with updated text sizes */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Partner
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.map((partner, index) => (
                    <tr
                      key={partner.user_id}
                      className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                        !partner.is_active ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleView(partner)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-xs font-medium text-gray-900">
                            {partner.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {partner.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            partner.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {partner.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(partner);
                            }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                            title="View Partner"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(partner);
                            }}
                            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                            title="Edit Partner"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(partner);
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                            title="Delete Partner"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination with updated text sizes */}
              <div className="flex items-center gap-4 px-6 py-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    Showing {indexOfFirstEntry + 1} to{" "}
                    {Math.min(indexOfLastEntry, filteredPartners.length)} of{" "}
                    {filteredPartners.length} entries
                  </span>
                  <div className="relative inline-block">
                    <select
                      value={entriesPerPage}
                      onChange={handleEntriesPerPageChange}
                      className="appearance-none w-16 pl-2 pr-6 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400"
                    >
                      {[20, 40, 60, 80, 100].map((number) => (
                        <option key={number} value={number} className="text-xs">
                          {number}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span className="px-3 py-1 text-xs text-white bg-gray-800 rounded">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
}
