import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPenToSquare,
  faTrash,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { queryKeys } from "../../../lib/react-query/queryKeys";
import Breadcrumb from "../../Breadcrumb";
import DataTable from "../../common/DataTable";
import DeleteConfirmModal from "../../common/DeleteConfirmModal/DeleteConfirmModal";
import CreateCategory from "./CreateCategory";

function ManageCategories() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Normalize data helper function
  const normaliseData = (categories) =>
    categories.map((category) => ({
      ...category,
      user_id: category.menu_cat_id,
    }));

  // Query for fetching categories
  const {
    data: categoryResponse,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: queryKeys.categories.list(outletId),
    queryFn: async () => {
      const token = getToken();
      const response = await axios.post(
        "https://menu4.xyz/v2/common/menu_category_list",
        {
          outlet_id: Number(outletId),
          user_id: adminData?.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled: !!adminData?.user_id && !!outletId,
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      return axios.delete("https://menu4.xyz/v2/common/menu_category_delete", {
        data: {
          menu_cat_id: categoryToDelete.menu_cat_id,
          outlet_id: categoryToDelete.outlet_id,
          user_id: adminData?.user_id,
          app_source: "admin_app",
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      // Invalidate and refetch categories
      queryClient.invalidateQueries(queryKeys.categories.list(outletId));
    },
    onError: (err) => {
      console.error(
        "Delete failed:",
        err.response?.data?.detail || "Failed to delete category"
      );
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      const token = getToken();
      const selectedCategoryIds = categoryData
        .filter((cat) => selectedIds.includes(cat.user_id))
        .map((cat) => cat.menu_cat_id);

      return axios.post(
        "https://menu4.xyz/v2/common/bulk_category_action",
        {
          user_id: adminData?.user_id,
          outlet_id: Number(outletId),
          action: action,
          app_source: "admin_app",
          menu_cat_ids: selectedCategoryIds,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      setSelectedItems([]);
      queryClient.invalidateQueries(queryKeys.categories.list(outletId));
    },
    onError: (err) => {
      console.error(
        "Bulk action failed:",
        err.response?.data?.message || "Failed to perform bulk action"
      );
    },
  });

  // Process the category data
  const categoryData = categoryResponse?.data?.menucat_details
    ? normaliseData(
        categoryResponse.data.menucat_details.filter(
          (cat) =>
            cat.menu_cat_id && cat.category_name && cat.category_name !== "all"
        )
      )
    : [];

  const outletInfo = categoryResponse?.data?.outlet_info || null;

  // Handlers
  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteMutation.mutate();
  };

  const handleBulkAction = (action, selectedIds) => {
    bulkActionMutation.mutate({ action, selectedIds });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  // Counts calculation
  const counts = {
    total: categoryData.length,
    active: categoryData[0]?.total_active_categories || 0,
    inactive: categoryData[0]?.total_inactive_categories || 0,
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Outlets", path: "/outlets" },
    {
      label: outletInfo?.outlet_name || "Loading...",
      path: `/view-outlet/${outletId}`,
    },
    { label: "Categories" },
  ];

  // Rest of your component remains the same...
  return (
    <>
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-1">
        {categoryLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : categoryError ? (
          <div className="col-span-full text-center py-8 text-error-500">
            {categoryError.message || "Failed to fetch category details"}
          </div>
        ) : (
          <div className="col-span-full">
            <MenuCategoryTable
              data={{ menucat_details: categoryData }}
              counts={counts}
              onDelete={(row) => {
                setCategoryToDelete(row);
                setShowDeleteModal(true);
              }}
              noDataMessage="No categories found. Create your first category to get started."
              onCreateCategory={() => navigate(`/create-category/${outletId}`)}
              onBulkAction={handleBulkAction}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              enableStatusFilter={true}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
            />
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onDelete={handleDeleteCategory}
      />
    </>
  );
}

function MenuCategoryTable({
  data,
  counts,
  onDelete,
  noDataMessage,
  onCreateCategory,
  onBulkAction,
  selectedItems,
  onSelectionChange,
  enableStatusFilter,
  statusFilter,
  onStatusFilterChange,
}) {
  const navigate = useNavigate();

  // Restrict bulk actions to only Active and Inactive
  const bulkActionOptions = [
    {
      key: "active",
      label: "Active",
      className: "text-gray-700 hover:bg-gray-100",
    },
    {
      key: "inactive",
      label: "Inactive",
      className: "text-gray-700 hover:bg-gray-100",
    },
  ];

  // Filter data based on status before rendering
  const filteredData = {
    ...data,
    menucat_details: data.menucat_details.filter((item) => {
      if (!item.menu_cat_id || !item.category_name) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return item.is_active === 1;
      if (statusFilter === "inactive") return item.is_active === 0;
      return true;
    }),
  };

  const handleView = (row) => {
    navigate(`/category-details/${row.outlet_id}/${row.menu_cat_id}`);
  };
  const handleEdit = (row) => {
    navigate(`/edit-category/${row.outlet_id}/${row.menu_cat_id}`);
  };
  const handleDelete = (row) => {
    if (onDelete) onDelete(row);
  };

  // Define columns for the DataTable
  const columns = [
    {
      field: "category_name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-3">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {value}
          </span>
        </div>
      ),
    },
    {
      field: "menu_count",
      header: "Menu Items",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center justify-center rounded-full  px-2.5 py-0.5 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-white/90">
          {value}
        </span>
      ),
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value === 1 ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              value === 1 ? "text-success-500" : "text-error-500"
            }`}
          />
          <span
            className={`text-base font-medium ${
              value === 1 ? "text-success-700" : "text-error-700"
            }`}
          >
            {value === 1 ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
            onClick={() => handleView(row)}
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Category"
            onClick={() => handleEdit(row)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Category"
            onClick={() => handleDelete(row)}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={filteredData.menucat_details}
      columns={columns}
      title="Menu Categories"
      counts={counts}
      enableSort={true}
      enableSearch={true}
      enablePagination={true}
      searchPlaceholder="Search"
      darkMode={false}
      showBackButton={true}
      onBackClick={() => navigate(-1)}
      backButtonLabel="Back"
      enableSelection={true}
      onBulkAction={onBulkAction}
      onSelectionChange={onSelectionChange}
      selectedItems={selectedItems}
      enableStatusFilter={enableStatusFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      createButton={{
        show: true,
        label: "Create",
        position: "right",
        className: "bg-success-500 hover:bg-success-600",
        onClick: onCreateCategory,
        icon: faPlus,
      }}
      noDataMessage={noDataMessage}
      bulkActionOptions={bulkActionOptions}
    />
  );
}

export default ManageCategories;
