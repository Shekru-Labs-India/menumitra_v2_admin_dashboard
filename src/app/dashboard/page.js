"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Users,
  ShoppingBag,
  UserCheck,
  Shield,
  Settings,
  Activity,
  LayoutGrid,
  Clock,
  CheckCircle,
  XCircle,
  Coffee,
  Package,
  AlertTriangle,
  Search,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit2,
  X,
} from "lucide-react";
import dashboardService from "@/api/services/dashboardService";
import tokenService from "@/services/tokenService";
// import Breadcrumbs from '@/components/Breadcrumbs';

// Enhanced StatCard component
const StatCard = ({ title, value, icon: Icon, color }) => {
  if (!Icon) {
    console.error(`Icon is missing for card: ${title}`);
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 flex-1">
      <div>
        <p className="text-lg font-semibold text-gray-900 mb-1">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <div
            className={`p-1.5 rounded-md ${color ? color : "bg-gray-100"} ${
              color ? "text-white" : "text-gray-500"
            }`}
          >
            <Icon size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated TableHeader component with centered text
const TableHeader = ({ label, sortKey, currentSort, setSort }) => {
  const isSorted = currentSort.key === sortKey;
  const isAsc = isSorted && currentSort.direction === "asc";

  return (
    <th
      className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => setSort(sortKey)}
    >
      <div className="flex items-center justify-center">
        <span>{label}</span>
        <span className="ml-1 text-gray-400">
          {isSorted ? (
            isAsc ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )
          ) : (
            <ChevronDown size={14} className="opacity-40" />
          )}
        </span>
      </div>
    </th>
  );
};

// Dashboard component
function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sort, setSort] = useState({ key: "outlet_name", direction: "asc" });
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getAdminHomeData();
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort outlets
  const filteredOutlets = dashboardData?.outlet_data
    ? dashboardData.outlet_data
        .filter((outlet) => {
          const matchesSearch = outlet.outlet_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

          if (selectedFilter === "all") return matchesSearch;
          if (selectedFilter === "active")
            return matchesSearch && outlet.total_order_count > 0;
          if (selectedFilter === "inactive")
            return matchesSearch && outlet.total_order_count === 0;

          return matchesSearch;
        })
        .sort((a, b) => {
          const direction = sort.direction === "asc" ? 1 : -1;

          if (sort.key === "outlet_name") {
            return (
              direction * (a.outlet_name?.localeCompare(b.outlet_name) || 0)
            );
          } else if (sort.key === "total_order_count") {
            // For status sorting, we'll use total_order_count > 0 to determine active/inactive
            const aStatus = a.total_order_count > 0;
            const bStatus = b.total_order_count > 0;
            return direction * (aStatus === bStatus ? 0 : aStatus ? 1 : -1);
          } else {
            return direction * ((a[sort.key] || 0) - (b[sort.key] || 0));
          }
        })
    : [];

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({
        key,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSort({
        key,
        direction: "asc",
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ isActive }) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-gray-100 text-gray-800 border border-gray-200"
      }`}
    >
      {isActive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
          Active
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span>
          Inactive
        </>
      )}
    </span>
  );

  // Function to navigate to outlet details
  const viewOutlet = (outletId) => {
    router.push(`/outlets/${outletId}`);
  };

  // Function to navigate to outlet edit
  const editOutlet = (outletId) => {
    router.push(`/outlets/${outletId}/edit`);
  };

  // Add this pagination logic after your existing filteredOutlets logic
  const totalPages = Math.ceil(filteredOutlets.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredOutlets.slice(startIndex, endIndex);

  // Add this pagination component
  const Pagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center">
          <span className="text-xs text-gray-700">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredOutlets.length)} of{" "}
            {filteredOutlets.length} entries
          </span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing entries per page
            }}
            className="ml-4 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-2 py-1 text-xs border rounded-md ${
                currentPage === number
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        {/* System-wide Statistics Skeleton */}
        <div className="mb-6">
          <div className="flex flex-row gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-3 border border-gray-200 flex-1"
              >
                <div>
                  <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 rounded-md bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Section Skeleton */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          {/* Header Section Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex flex-col items-start w-40">
              <div className="h-4 w-16 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {[...Array(11)].map((_, i) => (
                      <th
                        key={i}
                        className="px-2 py-2 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {[...Array(11)].map((_, j) => (
                        <td
                          key={j}
                          className="px-2 py-2 whitespace-nowrap text-center"
                        >
                          <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Skeleton */}
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* System-wide Statistics */}
      <div className="mb-6">
        <div className="flex flex-row gap-2">
          <StatCard
            title="Restaurant Owners"
            value={dashboardData?.counts?.owner_count || 0}
            icon={UserCheck}
            color="bg-gray-900"
          />
          <StatCard
            title="Partners"
            value={dashboardData?.counts?.partner_count || 0}
            icon={Users}
            color="bg-gray-800"
          />
          <StatCard
            title="Total Outlets"
            value={dashboardData?.counts?.outlet_count || 0}
            icon={ShoppingBag}
            color="bg-gray-700"
          />
          <StatCard
            title="Customers"
            value={dashboardData?.counts?.customer_count || 0}
            icon={Users}
            color="bg-gray-900"
          />
          <StatCard
            title="Guests"
            value={dashboardData?.counts?.guest_count || 0}
            icon={Users}
            color="bg-gray-800"
          />
          <StatCard
            title="Total Orders"
            value={dashboardData?.counts?.total_orders || 0}
            icon={ShoppingBag}
            color="bg-gray-700"
          />
        </div>
      </div>

      {/* Outlet List Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="flex flex-col items-start w-40">
            <div className="flex flex-col items-start">
              <span className="text-[12px] font-bold text-black leading-tight">
                {filteredOutlets.length}
              </span>
              <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
                TOTAL
              </span>
            </div>
            <div className="text-left mt-1">
              {selectedFilter !== "all" && (
                <span className="text-[12px] text-gray-500">
                  {selectedFilter === "active" ? "Active" : "Inactive"} Outlets
                </span>
              )}
              {searchTerm && selectedFilter === "all" && (
                <span className="text-[12px] text-gray-500">Found Outlets</span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-[12px] bg-white text-gray-900 appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="all">All Outlets</option>
              <option value="active">Active Outlets</option>
              <option value="inactive">Inactive Outlets</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search outlets..."
                className="w-full sm:w-64 pl-9 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-[12px] text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {!dashboardData ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="h-12 bg-gray-900 w-full"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-gray-200">
                <div className="h-16 px-2 py-2 flex items-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOutlets.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <TableHeader
                      label="Outlet Name"
                      sortKey="outlet_name"
                      currentSort={sort}
                      setSort={handleSort}
                    />

                    <TableHeader
                      label="Orders"
                      sortKey="total_order_count"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Cooking"
                      sortKey="total_cooking_count"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Placed"
                      sortKey="total_placed_count"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Paid"
                      sortKey="total_paid_count"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Cancelled"
                      sortKey="total_cancel_count"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Categories"
                      sortKey="total_category"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Menu Items"
                      sortKey="total_menu"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Status"
                      sortKey="total_order_count"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <TableHeader
                      label="Account Type"
                      sortKey="account_type"
                      currentSort={sort}
                      setSort={handleSort}
                    />
                    <th className="px-2 py-2 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.map((outlet) => (
                    <tr
                      key={outlet.outlet_id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => viewOutlet(outlet.outlet_id)}
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs font-medium text-gray-900">
                          {outlet.outlet_name}
                        </div>
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {outlet.total_order_count}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {outlet.total_cooking_count}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {outlet.total_placed_count}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {outlet.total_paid_count}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {outlet.total_cancel_count}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {outlet.total_category}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <div className="text-xs text-gray-900">
                          {outlet.total_menu}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <StatusBadge isActive={outlet.total_order_count > 0} />
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
                      <td
                        className="px-2 py-2 whitespace-nowrap text-center text-xs font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-center space-x-2">
                          <button
                            className="flex items-center justify-center w-7 h-7 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                            onClick={() => editOutlet(outlet.outlet_id)}
                            aria-label="Edit outlet"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={() => viewOutlet(outlet.outlet_id)}
                            aria-label="View outlet details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <AlertTriangle size={40} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No outlets found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? `No outlets match your search: "${searchTerm}"`
                : "No outlets available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
