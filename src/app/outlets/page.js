"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Filter,
  Search,
  ToggleRight,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import outletService from "@/api/services/outletService";
import { isAuthenticated } from "@/utils/auth";
import Modal from "@/components/ui/Modal";
import Breadcrumb from "@/components/Breadcrumb";

// TableHeader component
const TableHeader = ({ label, field, width = "w-auto", align = "center" }) => {
  return (
    <th
      className={`px-2 py-1 ${width} text-${align} font-medium text-gray-700 uppercase tracking-wider text-[12px]`}
    >
      {label}
    </th>
  );
};

// Format phone number for display
const formatPhoneNumber = (phone) => {
  if (!phone) return "-";
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

export default function OutletsPage() {
  const router = useRouter();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    outlet: null,
  });
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }
    fetchOutlets();
  }, [router]);

  // Fetch outlets from API
  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const userId = 2; // TODO: Get from auth context
      const response = await outletService.listOutlets(userId);

      // Transform API data to match the component's expected format
      const formattedOutlets = Array.isArray(response)
        ? response.map((outlet) => ({
            outlet_id: outlet.outlet_id,
            name: outlet.outlet_name || outlet.name,
            code: outlet.outlet_code,
            mobile: outlet.mobile,
            is_active: outlet.outlet_status === 1 || outlet.is_active,
            is_open: outlet.is_open === 1,
            account_type: outlet.account_type,
          }))
        : [];

      setOutlets(formattedOutlets);
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
      toast.error("Failed to load outlets");
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (outlet, e) => {
    e?.stopPropagation();
    setDeleteModal({ isOpen: true, outlet });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, outlet: null });
  };

  // Handle delete outlet
  const handleDelete = async () => {
    setLoading(true);
    try {
      const userId = 1; // Replace with actual user ID from auth context/session
      await outletService.deleteOutlet(deleteModal.outlet.outlet_id, userId);
      toast.success("Outlet deleted successfully");
      fetchOutlets();
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete outlet:", error);
      toast.error("Failed to delete outlet");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to outlet details
  const viewOutlet = (outletId) => {
    router.push(`/outlets/${outletId}`);
  };

  // Navigate to edit outlet
  const editOutlet = (outletId) => {
    router.push(`/outlets/${outletId}/edit`);
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Filter and sort outlets
  const filteredOutlets = outlets
    .filter((outlet) => {
      const matchesSearch =
        outlet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.mobile?.includes(searchTerm);

      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "active") return matchesSearch && outlet.is_active;
      if (statusFilter === "inactive")
        return matchesSearch && !outlet.is_active;

      return matchesSearch;
    })
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortField === "name") {
        return direction * (a.name?.localeCompare(b.name) || 0);
      }
      if (sortField === "code") {
        return direction * (a.code?.localeCompare(b.code) || 0);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredOutlets.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredOutlets.slice(startIndex, endIndex);

  // Render delete confirmation modal content
  const renderDeleteConfirmation = () => {
    if (!deleteModal.outlet) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Confirm Deletion
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete outlet "{deleteModal.outlet.name}"?
            This action cannot be undone. All data associated with this outlet
            will be permanently removed.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={closeDeleteModal}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-[12px] font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md text-[12px] font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:bg-red-300"
          >
            {loading ? "Deleting..." : "Delete Outlet"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-1 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Card container for Top bar (Total count, Filter & Search, Create Outlet button) and Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 -mt-5">
        {/* Top bar: Back, Title, Create Outlet */}
        <div className="p-2 flex items-center relative mb-1">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="mr-1" size={12} /> Back
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-gray-900">
            Outlet Management
          </h1>
          <div className="flex-1" />
          <button
            onClick={() => router.push("/outlets/create")}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-colors duration-200"
          >
            <Plus className="mr-2" />
            Create Outlet
          </button>
        </div>

        {/* Second row: Total Count (left) and Filter & Search (right) */}
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Total Count */}
          <div className="flex flex-col items-start w-40 mb-3 md:mb-0">
            <div className="flex flex-col items-start">
              <span className="text-[12px] font-bold text-black leading-tight">
                {filteredOutlets.length}
              </span>
              <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
                TOTAL
              </span>
            </div>
            {statusFilter !== "all" && (
              <div className="text-left mt-1">
                <span className="text-[12px] text-gray-500">
                  {statusFilter === "active" ? "Active" : "Inactive"} Outlets
                </span>
              </div>
            )}
          </div>

          {/* Filter and Search */}
          <div className="flex items-center space-x-2">
            <select
              className="block w-56 h-10 pl-3 pr-8 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <div className="relative w-56 h-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search outlets..."
                className="block w-full h-10 pl-10 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-xs text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table with pagination */}
        <div className="bg-white overflow-hidden">
          {loading ? (
            <div className="animate-pulse">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <div className="px-4 py-2 flex items-center justify-center">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-7 w-16 bg-gray-200 rounded mr-2"></div>
                    <div className="flex space-x-1">
                      <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                      <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                      <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentEntries.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200 text-[12px]">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeader
                      label="Outlet Name"
                      field="name"
                      width="w-2/5"
                      align="left"
                    />
                    <TableHeader label="Code" field="code" width="w-1/6" />
                    <th className="px-2 py-1 text-center font-medium text-gray-700 uppercase tracking-wider w-1/6 text-[12px]">
                      Mobile
                    </th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 uppercase tracking-wider w-1/8 text-[12px]">
                      Account Type
                    </th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 uppercase tracking-wider w-1/8 text-[12px]">
                      Open/Close
                    </th>
                    <TableHeader label="Status" field="" width="w-1/8" />
                    <th className="px-2 py-1 text-center font-medium text-gray-700 uppercase tracking-wider w-1/8 text-[12px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-[12px]">
                  {currentEntries.map((outlet) => (
                    <tr
                      key={outlet.outlet_id}
                      className="transition-colors duration-150 cursor-pointer bg-white hover:bg-gray-50"
                      onClick={() => viewOutlet(outlet.outlet_id)}
                    >
                      {/* First column left aligned */}
                      <td className="px-2 py-1 whitespace-nowrap text-left">
                        <div className="flex flex-col items-start justify-center">
                          <div className="font-medium text-gray-900">
                            {outlet.name}
                          </div>
                        </div>
                      </td>
                      {/* Other columns centered */}
                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <div className="text-gray-500">
                          {outlet.code || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <div className="text-gray-500">
                          {outlet.mobile || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-0.5 inline-flex items-center text-xs font-medium rounded-full ${
                            outlet.account_type?.toLowerCase() === "live"
                              ? "text-gray-900"
                              : "bg-yellow-50 text-yellow-800"
                          }`}
                        >
                          {outlet.account_type?.toLowerCase() === "live" ? (
                            <CheckCircle
                              size={12}
                              className="mr-1 text-green-800"
                            />
                          ) : (
                            <AlertTriangle size={12} className="mr-1" />
                          )}
                          {outlet.account_type?.toLowerCase() === "live"
                            ? "Live"
                            : "Test"}
                        </span>
                      </td>

                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${
                            outlet.is_open
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {outlet.is_open ? (
                            <>
                              {/* <ToggleRight className="mr-1" /> */}
                              Open
                            </>
                          ) : (
                            <>
                              {/* <ToggleLeft className="mr-1" /> */}
                              Closed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${
                            outlet.is_active
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {outlet.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        className="px-2 py-1 whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => viewOutlet(outlet.outlet_id)}
                            className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-[12px]"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => editOutlet(outlet.outlet_id)}
                            className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-[12px]"
                            title="Edit Outlet"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(outlet, e)}
                            className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-[12px]"
                            title="Delete Outlet"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-2 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2 text-[12px] text-gray-700">
                  <span>
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredOutlets.length)} of{" "}
                    {filteredOutlets.length} entries
                  </span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 border border-gray-300 rounded px-2 py-1 text-[12px]"
                  >
                    {[20, 40, 60, 80, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-1 mt-2 md:mt-0">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-[12px] border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-2 py-1 text-[12px] border rounded ${
                        currentPage === i + 1
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-[12px] border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-[0.75rem] text-gray-400">
              No outlets found.
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
}
