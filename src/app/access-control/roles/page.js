"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ubacService from "@/api/services/ubacService";
import { isAuthenticated } from "@/utils/auth";
import { getAuthHeaders, getAuthToken } from "@/utils/apiUtils";
import { FiEye, FiArrowLeft } from "react-icons/fi";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added Breadcrumb import

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }
  }, [router]);

  // Table columns configuration
  const columns = [
    {
      header: "Sr No",
      render: (row, index) => (
        <span className="text-gray-800 font-medium inline-block w-full text-center">
          {index + 1}
        </span>
      ),
    },
    {
      header: "Role Name",
      accessor: "role_name",
      render: (row) => (
        <span className="capitalize text-gray-800 font-medium inline-block w-full text-center">
          {row.role_name}
        </span>
      ),
    },
    {
      header: "Functionalities",
      accessor: "functionalities",
      render: (row) => (
        <span className="text-gray-800 inline-block w-full text-center">
          {row.functionalities?.length || 0} assigned
        </span>
      ),
    },
    {
      header: "Created On",
      accessor: "created_on",
      render: (row) => (
        <span className="text-gray-800 inline-block w-full text-center">
          {formatDate(row.created_on)}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="View Functionalities"
          >
            <FiEye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Fetch roles on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchRoles();
    }
  }, []);

  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const mappingsData = await ubacService.getRoleFunctionalityMappings();
      if (mappingsData && mappingsData.detail === "Not authenticated") {
        toast.error("Authentication required. Please log in.");
        router.push("/auth/login");
        return;
      }
      if (Array.isArray(mappingsData)) {
        // Create a map to store unique roles
        const roleMap = new Map();

        // Process each mapping to extract unique roles
        mappingsData.forEach((mapping) => {
          if (mapping.role_name) {
            // Use role_name as the key to ensure uniqueness
            if (!roleMap.has(mapping.role_name)) {
              roleMap.set(mapping.role_name, {
                ubac_role_id: mapping.role_id, // Using role_name as ID since it's unique
                role_name: mapping.role_name,
                created_on: mapping.created_on || new Date().toISOString(),
                functionalities: [],
              });
            }

            // Add functionality to the role if it doesn't exist
            const role = roleMap.get(mapping.role_name);
            if (mapping.functionality_id && mapping.functionality_name) {
              const functionality = {
                id: mapping.functionality_id,
                name: mapping.functionality_name,
              };
              if (
                !role.functionalities.some((f) => f.id === functionality.id)
              ) {
                role.functionalities.push(functionality);
              }
            }
          }
        });

        // Convert map to array and sort by role name
        const uniqueRoles = Array.from(roleMap.values()).sort((a, b) =>
          a.role_name.localeCompare(b.role_name)
        );

        console.log("Processed roles:", uniqueRoles);
        setRoles(uniqueRoles);
      } else {
        console.error(
          "API did not return an array for mappings:",
          mappingsData
        );
        setRoles([]);
        toast.error("Failed to retrieve roles from server");
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      if (error.message && error.message.includes("Not authenticated")) {
        toast.error("Authentication required. Please log in.");
        router.push("/auth/login");
      } else {
        toast.error("Failed to load roles");
      }
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // View role's assigned functionalities
  const handleView = async (roleId) => {
    try {
      if (!roleId?.role_name) {
        toast.error("Invalid role");
        return;
      }
      console.log("handleView called with role:", roleId);
      router.push(`/access-control/role-mapping/${roleId.role_name}`);
    } catch (error) {
      console.error("Failed to fetch role functionalities:", error);
      toast.error("Failed to load role functionalities");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredRoles = roles.filter((role) =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredRoles.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredRoles.slice(startIndex, endIndex);

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      {/* Add Breadcrumb at the top */}
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Card header with back button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden -mt-5">
        <div className="px-4 py-3 bg-white flex items-center relative">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-1" size={12} />
            Back
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-gray-900">
            Roles
          </h1>
        </div>

        {/* Table header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-black">
                {roles.length}
              </span>
              <span className="text-xs text-gray-500">TOTAL</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search roles..."
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs focus:ring-gray-500 focus:border-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-3.5 w-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No roles found</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={`header-${index}`}
                        scope="col"
                        className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.map((role, rowIndex) => (
                    <tr
                      key={`role-${role.ubac_role_id}-${rowIndex}`}
                      className="hover:bg-gray-50"
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={`cell-${role.ubac_role_id}-${colIndex}`}
                          className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center"
                        >
                          {column.render
                            ? column.render(role, rowIndex)
                            : role[column.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
                <div className="flex items-center text-xs text-gray-500">
                  <span>
                    Showing 1 to {currentEntries.length} of{" "}
                    {filteredRoles.length} entries
                  </span>
                  <select
                    value={entriesPerPage}
                    onChange={handleEntriesPerPageChange}
                    className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="20">20</option>
                    <option value="40">40</option>
                    <option value="60">60</option>
                    <option value="80">80</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-gray-900 text-white rounded-md text-xs">
                    {currentPage}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(pageCount, currentPage + 1))
                    }
                    disabled={currentPage === pageCount}
                    className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
