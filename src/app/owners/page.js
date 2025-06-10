"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle
} from "react-icons/fi";
import DataTable from "@/components/ui/DataTable";
import ownerService from "@/api/services/ownerService";
import { isAuthenticated } from "@/utils/auth";
import tokenService from "@/services/tokenService";
import Modal from "@/components/ui/Modal";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added import

export default function OwnersPage() {
  const router = useRouter();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }
  }, [router]);

  // Fetch owners on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchOwners();
    }
  }, []);

  // Fetch owners from API
  const fetchOwners = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1; // Get userId from auth context
      console.log("Fetching owners for user ID:", userId);

      const data = await ownerService.listOwners(userId);

      if (data.detail && typeof data.detail === "string") {
        // This is an error response from the API
        setError(data.detail);
        setLoading(false);
        return;
      }

      setOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch owners:", error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || "Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to add new owner page
  const handleAddNew = () => {
    router.push("/owners/create");
  };

  // Navigate to edit page for specific owner
  const handleEdit = (owner) => {
    router.push(`/owners/edit/${owner.user_id}`);
  };

  // Navigate to view page for specific owner
  const handleView = (owner) => {
    router.push(`/owners/view/${owner.user_id}`);
  };

  // Show delete confirmation modal
  const confirmDelete = (owner) => {
    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setOwnerToDelete(null);
  };

  // Handle owner deletion
  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1; // Get userId from auth context

      const response = await ownerService.deleteOwner(
        ownerToDelete.user_id,
        userId
      );

      if (response.detail) {
        if (response.detail.includes("successfully")) {
          toast.success(response.detail);
          fetchOwners(); // Refresh the list
        } else {
          // This is an error message from the API
          setError(response.detail);
          setShowDeleteModal(false);
        }
      } else {
        toast.success("Owner deleted successfully");
        fetchOwners(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete owner:", error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || "Failed to delete owner");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setOwnerToDelete(null);
    }
  };

  // Render delete confirmation modal content
  const renderDeleteConfirmation = () => {
    if (!ownerToDelete) return null;

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
            Are you sure you want to delete this owner? This action cannot be
            undone. All data associated with this owner will be permanently
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
            {loading ? "Deleting..." : "Delete Owner"}
          </button>
        </div>
      </div>
    );
  };

  // Render skeleton loading elements
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
              Owner
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
              Address
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Account Type
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
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
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

  // Filter owners based on search query
  const filteredOwners = owners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.mobile.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredOwners.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredOwners.length / entriesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Change entries per page
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Single card container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden -mt-5">
        {/* Header section with Create button */}
        <div className="px-6 py-4  border-gray-200 bg-white flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-1" size={12} />
            Back
          </button>

          {/* Added centered title */}
          <h1 className="text-lg font-semibold text-gray-900">
            Owner Management
          </h1>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-colors duration-200"
          >
            <FiPlus className="mr-1.5" size={12} />
            Create Owner
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 pt-3">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h3 className="text-xs font-medium text-red-800 mb-1">Error</h3>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats and Search bar */}
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div>
              <span className="text-xs font-bold text-black leading-tight">
                {filteredOwners.length}
              </span>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                TOTAL
              </p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-gray-200 focus:border-gray-400 w-56"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
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

        {/* Table content */}
        <div className="px-4 py-3">
          {loading && !error ? (
            renderSkeletonLoaders()
          ) : owners.length === 0 && !error ? (
            <div className="text-center py-8">
              <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No owners found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new owner
              </p>
              <button
                onClick={handleAddNew}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add New Owner
              </button>
            </div>
          ) : !error ? (
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
                      Owner
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
                      Address
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Account Type
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
                  {currentEntries.map((owner, index) => (
                    <tr
                      key={owner.user_id}
                      className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                        !owner.is_active ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleView(owner)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {owner.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {owner.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {owner.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {owner.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            owner.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {owner.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                            owner.account_type?.toLowerCase() === "live"
                              ? " text-green-800  "
                              : " text-yellow-800 border"
                          }`}
                        >
                          {owner.account_type?.toLowerCase() === "live" ? (
                            <FiCheckCircle className="mr-1" size={12} /> // Green check icon for Live
                          ) : (
                            <FiAlertTriangle className="mr-1" size={12} /> // Yellow triangle icon for Test
                          )}
                          {owner.account_type?.toLowerCase() === "live"
                            ? "Live"
                            : "Test"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View Button - Info Blue */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(owner);
                            }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                            title="View Owner"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          {/* Edit Button - Orange */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(owner);
                            }}
                            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                            title="Edit Owner"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>

                          {/* Delete Button - Red */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(owner);
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                            title="Delete Owner"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination - adjusted styling */}
              <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    Showing {indexOfFirstEntry + 1} to{" "}
                    {Math.min(indexOfLastEntry, filteredOwners.length)} of{" "}
                    {filteredOwners.length} entries
                  </span>
                  <select
                    value={entriesPerPage}
                    onChange={handleEntriesPerPageChange}
                    className="ml-2 w-16 border border-gray-200 rounded text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    {[20, 40, 60, 80, 100].map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-2 py-1 bg-gray-800 text-white rounded text-xs">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50"
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
