import React, { useEffect, useState } from "react";
import Breadcrumb from "../Breadcrumb";
import { useNavigate } from "react-router-dom";
import DataTable from "../common/DataTable";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";

const BookingEnquiry = () => {
  const { getToken } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      // Using public endpoint from user-provided API — no token required, fall back to GET
      const url = "https://menu4.xyz/v2/website_api/listview_website_booking";
      const resp = await axios.get(url, {
        headers: token
          ? { Authorization: token, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
      });

      if (resp.data && Array.isArray(resp.data.data)) {
        setBookings(resp.data.data || []);
      } else if (resp.data && resp.data.data?.data) {
        setBookings(resp.data.data.data || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      String(b.booking_id).includes(q) ||
      (b.name || "").toLowerCase().includes(q) ||
      (b.mobile || "").toLowerCase().includes(q) ||
      (b.outlet_name || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q)
    );
  });

  const columns = [
    { field: "name", header: "Name", sortable: true },
    { field: "mobile", header: "Mobile", sortable: true },
    { field: "outlet_name", header: "Outlet", sortable: true },
    { field: "outlet_type", header: "Type", sortable: true },
    { field: "city", header: "City", sortable: true },
    { field: "email", header: "Email", sortable: true },
    { field: "created_on", header: "Created On", sortable: true },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Bookings", path: "/bookings" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-4 p-4">
        <DataTable
          data={filtered}
          title="Bookings"
          columns={columns}
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onBackClick={handleBack}
          enablePagination={true}
          showSearch={true}
          createButton={{ show: false, label: "", onClick: () => {} }}
          showBulkActions={false}
          enableStatusFilter={false}
          enableEnquiry={false}
          counts={{
            total: filtered.length,
            active: null,
            inactive: null,
          }}
        />
      </div>
    </>
  );
};

export default BookingEnquiry;
