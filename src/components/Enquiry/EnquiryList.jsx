import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import Breadcrumb from "../Breadcrumb";
import DataTable from "../common/DataTable";
import { toastController } from "../../utils/toastController";

const EnquiryList = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  const [enquiries, setEnquiries] = useState([]);
  // Calculate counts for stats row (after enquiries is defined)
  const counts = {
    total: enquiries.length,
    enquiry: enquiries.filter((e) => e.enquiry_status === "Enquiry").length,
    positive: enquiries.filter((e) => e.enquiry_status === "Positive").length,
    onboard: enquiries.filter((e) => e.enquiry_status === "Onboard").length,
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Default to showing 'Enquiry' entries on load
  const [statusFilter, setStatusFilter] = useState("enquiry");

  const handleBack = () => navigate(-1);
  // Fetch enquiries using new API
  const fetchEnquiries = async (
    page = 1,
    limit = itemsPerPage,
    status = statusFilter
  ) => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const requestBody = {
        page,
        limit,
      };

      // Only add status_filter if it's not empty
      if (status && status !== "") {
        requestBody.status_filter = status;
      }

      const response = await axios.post(
        "https://menu4.xyz/v2/common/list_enquiries",
        requestBody,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data) {
        const apiData = response.data.data;
        setEnquiries(apiData.enquiries || []);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      setError(error.message || "Failed to fetch enquiries");
      toastController.showError("Failed to fetch enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries(1, itemsPerPage, statusFilter);
  }, [itemsPerPage, statusFilter]);

  // Filter enquiries based on search term and status
  const getFilteredEnquiries = () => {
    return enquiries.filter((enquiry) => {
      const matchesSearch =
        !searchTerm ||
        enquiry.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.hotel_mobile_1
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(enquiry.enquiry_id).includes(searchTerm);

      // Only apply status filter if statusFilter is not empty
      const matchesStatus =
        !statusFilter ||
        statusFilter === "" ||
        statusFilter === "all" ||
        enquiry.enquiry_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const columns = [
    {
      field: "hotel_name",
      header: "Hotel Name",
      sortable: true,
      render: (value) => <span>{value || "-"}</span>,
    },
    {
      field: "location",
      header: "Location",
      sortable: true,
      render: (value) => <span>{value || "-"}</span>,
    },
    {
      field: "hotel_mobile_1",
      header: "Hotel Mobile 1",
      sortable: true,
      render: (value) => <span>{value || "-"}</span>,
    },

    {
      field: "enquiry_datetime",
      header: "Enquiry Date",
      sortable: true,
      render: (value) => <span>{value || "-"}</span>,
    },
    {
      field: "enquiry_status",
      header: "Status",
      sortable: true,
      render: (value) => {
        if (!value) return <span>-</span>;

        let statusClass = "";
        switch (value) {
          case "Enquiry":
            statusClass = "bg-warning-100 text-warning-500";
            break;
          case "Positive":
            statusClass = "text-brand-500";
            break;
          case "Onboard":
            statusClass = "bg-success-100 text-success-700";
            break;
          default:
            statusClass = "text-gray-700";
        }

        return (
          <span className={`font-medium px-2 py-1 rounded ${statusClass}`}>
            {value}
          </span>
        );
      },
    },
    {
      field: "action",
      header: "Action",
      sortable: false,
      render: (_, enquiry) => (
        <button
          onClick={() => navigate(`/view-enquiry/${enquiry.enquiry_id}`)}
          className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-brand-500 px-2 py-2 font-medium text-white hover:bg-brand-600"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const handleViewEnquiry = (enquiry) => {
    // Navigate to enquiry details page
    navigate(`/enquiry-details/${enquiry.enquiry_id}`);
  };

  const handleEditEnquiry = (enquiry) => {
    // Navigate to edit enquiry page
    navigate(`/edit-enquiry/${enquiry.enquiry_id}`);
  };

  const handleDeleteEnquiry = async (enquiry) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        const token = getToken();
        if (!token) throw new Error("No authentication token available");

        const response = await axios.delete(
          `${BASE_URL}/${API_VERSION}/admin/delete_enquiry/${enquiry.id}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.success) {
          toastController.showSuccess("Enquiry deleted successfully");
          fetchEnquiries(); // Refresh the list
        } else {
          throw new Error(response.data?.message || "Failed to delete enquiry");
        }
      } catch (error) {
        console.error("Error deleting enquiry:", error);
        toastController.showError(error.message || "Failed to delete enquiry");
      }
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      let response;
      switch (action) {
        case "delete":
          response = await axios.post(
            `${BASE_URL}/${API_VERSION}/admin/bulk_delete_enquiries`,
            { enquiry_ids: selectedIds },
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );
          break;
        case "update_status":
          response = await axios.post(
            `${BASE_URL}/${API_VERSION}/admin/bulk_update_enquiry_status`,
            { enquiry_ids: selectedIds, status: "resolved" },
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );
          break;
        default:
          throw new Error("Invalid action");
      }

      if (response.data && response.data.success) {
        toastController.showSuccess("Bulk action completed successfully");
        fetchEnquiries(); // Refresh the list
        setSelectedItems([]);
      } else {
        throw new Error(
          response.data?.message || "Failed to perform bulk action"
        );
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toastController.showError(
        error.message || "Failed to perform bulk action"
      );
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Enquiries", path: "/enquiries" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
        <DataTable
          data={getFilteredEnquiries()}
          title="Enquiries"
          columns={columns}
          counts={counts}
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by ID, hotel name, location or contact number..."
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onBulkAction={handleBulkAction}
          onBackClick={handleBack}
          bulkActions={[
            { label: "Delete Selected", value: "delete" },
            { label: "Mark as Resolved", value: "update_status" },
          ]}
          enableEnquiry={true}
          createButton={{ show: false, label: "", onClick: () => {} }}
          enableStatusFilter={false}
          enquiryFilter={statusFilter}
          onEnquiryFilterChange={(value) => {
            setStatusFilter(value);
            fetchEnquiries(1, itemsPerPage, value);
          }}
          showSearch={true}
          showBulkActions={true}
          showPagination={true}
        />
      </div>
    </>
  );
};

export default EnquiryList;
