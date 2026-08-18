import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DatePickerInput from "../common/DatePickerInput";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";

function CombinedStats() {
  // --- API Usage State and Logic (from Stats.jsx) ---
  const { getToken } = useAuth();
  const [apiStatsData, setApiStatsData] = useState({
    total_api_calls: 0,
    endpoint_statistics: [],
    date_range: {
      start_date: "",
      end_date: "",
    },
  });
  const [apiPayload, setApiPayload] = useState({
    app_source: "owner_app",
    start_date: getISODateString(new Date()),
    end_date: getISODateString(new Date()),
  });
  const [appSourceOptions, setAppSourceOptions] = useState([]);
  const [apiIsLoading, setApiIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [apiSearchTerm, setApiSearchTerm] = useState("");

  // --- DB Table Stats State and Logic (from DBTablesStats.jsx) ---
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [dbStatsData, setDbStatsData] = useState({
    summary: {
      total_tables: 0,
      total_records: 0,
      tables_with_data: 0,
      empty_tables: 0,
    },
    table_statistics: [],
  });
  const [dbIsLoading, setDbIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [dbSearchTerm, setDbSearchTerm] = useState("");

  // --- Breadcrumb ---
  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Stats", path: "/stats" },
    { label: "API Usage & Database Tables" },
  ];

  // --- Helper functions ---
  function getISODateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function formatDateForApi(yyyy_mm_dd) {
    if (!yyyy_mm_dd) return "";
    const [year, month, day] = yyyy_mm_dd.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Helper to format date in '09-Jul-2025 07:47:47 PM' and small font
  function renderSmallDate(value) {
    if (!value) return <span className="text-xs">-</span>;
    const date = new Date(value);
    if (isNaN(date.getTime())) return <span className="text-xs">{value}</span>;
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = hours.toString().padStart(2, "0");
    return (
      <span className="text-xs">{`${day}-${month}-${year} ${hourStr}:${minutes}:${seconds} ${ampm}`}</span>
    );
  }

  // --- API Usage: Fetch app sources ---
  useEffect(() => {
    const fetchAppSources = async () => {
      try {
        const response = await fetch(
          "https://menu4.xyz/v2/common/get_list/app_source",
          {
            method: "GET",
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch app sources");
        const data = await response.json();
        const options = Object.entries(data.app_source_list).map(
          ([value, label]) => ({
            value,
            label: label
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
          })
        );
        setAppSourceOptions(options);
      } catch (error) {
        console.error("Error fetching app sources:", error);
      }
    };
    fetchAppSources();
  }, [getToken]);

  // --- API Usage: Fetch stats ---
  useEffect(() => {
    const fetchStats = async () => {
      setApiIsLoading(true);
      setApiError(null);
      try {
        const apiPayloadFormatted = {
          ...apiPayload,
          start_date: formatDateForApi(apiPayload.start_date),
          end_date: formatDateForApi(apiPayload.end_date),
        };
        const response = await fetch(
          "https://menu4.xyz/v2/admin/app_usage_stats",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiPayloadFormatted),
          }
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setApiStatsData(data);
      } catch (error) {
        setApiError("Failed to fetch API usage stats");
        setApiStatsData({
          total_api_calls: 0,
          endpoint_statistics: [],
          date_range: { start_date: "", end_date: "" },
        });
      } finally {
        setApiIsLoading(false);
      }
    };
    fetchStats();
  }, [apiPayload]);

  // --- DB Table Stats: Fetch stats ---
  useEffect(() => {
    const fetchTableStats = async () => {
      setDbIsLoading(true);
      setDbError(null);
      try {
        const response = await fetch(
          `${BASE_URL}/${API_VERSION}/admin/table_stats`,
          {
            method: "GET",
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch table statistics");
        const data = await response.json();
        setDbStatsData(data);
      } catch (error) {
        setDbError("Failed to fetch table statistics");
        setDbStatsData({
          summary: {
            total_tables: 0,
            total_records: 0,
            tables_with_data: 0,
            empty_tables: 0,
          },
          table_statistics: [],
        });
      } finally {
        setDbIsLoading(false);
      }
    };
    fetchTableStats();
  }, [BASE_URL, API_VERSION, getToken]);

  // --- API Usage: Columns ---
  const apiColumns = [
    { field: "endpoint", header: "Endpoint", sortable: true },
    { field: "app_source", header: "App Source", sortable: true },
    { field: "call_count", header: "Call Count", sortable: true },
    {
      field: "last_accessed",
      header: "Last Accessed",
      sortable: true,
      render: renderSmallDate,
    },
  ];

  // --- DB Table Stats: Columns ---
  const dbColumns = [
    { field: "table_name", header: "Table Name", sortable: true },
    { field: "record_count", header: "Record Count", sortable: true },
    {
      field: "last_record_date",
      header: "Last Record Date",
      sortable: true,
      render: renderSmallDate,
    },
  ];

  // --- API Usage: Filter change handler ---
  const handleApiFilterChange = (filterType, value) => {
    setApiPayload((prev) => ({ ...prev, [filterType]: value }));
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      {/* Two-column layout for both tables with vertical scroll only */}
      <div className="flex flex-col md:flex-row gap-2">
        {/* API Usage Section */}
        <div className="w-full md:w-1/2 max-h-[350px] overflow-y-auto overflow-x-hidden">
          <h2 className="text-sm font-semibold mb-1">API Usage Statistics</h2>
          <DataTable
            data={apiStatsData.endpoint_statistics || []}
            columns={apiColumns}
            // title="API Usage Statistics"
            counts={null}
            enableSearch={true}
            enableSort={true}
            searchTerm={apiSearchTerm}
            onSearchChange={setApiSearchTerm}
            emptyStateMessage="No API usage data available."
            enableStatusFilter={false}
            showCreateButton={false}
            showBackButton={false}
            createButton={{ show: false }}
            isLoading={apiIsLoading}
            error={apiError}
            itemsPerPage={20}
            className="compact-table"
            customFilters={[
              {
                type: "select",
                label: "App Name",
                value: apiPayload.app_source,
                options: appSourceOptions,
                onChange: (value) => handleApiFilterChange("app_source", value),
                placeholder: "Select App",
              },
              {
                type: "custom",
                label: "Start Date",
                component: (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Start Date
                    </label>
                    <DatePickerInput
                      value={apiPayload.start_date}
                      onChange={(e) =>
                        handleApiFilterChange("start_date", e.target.value)
                      }
                      placeholder="Select start date"
                      className="w-full sm:w-64 text-xs py-1 px-2"
                    />
                  </div>
                ),
              },
              {
                type: "custom",
                label: "End Date",
                component: (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      End Date
                    </label>
                    <DatePickerInput
                      value={apiPayload.end_date}
                      onChange={(e) =>
                        handleApiFilterChange("end_date", e.target.value)
                      }
                      placeholder="Select end date"
                      className="w-full sm:w-64 text-xs py-1 px-2"
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
        {/* DB Table Stats Section */}
        <div className="w-full md:w-1/2 max-h-[350px] overflow-y-auto overflow-x-hidden">
          <h2 className="text-sm font-semibold mb-1">
            Database Tables Statistics
          </h2>
          <DataTable
            data={dbStatsData.table_statistics}
            columns={dbColumns}
            // title="Database Tables Statistics"
            enableSearch={true}
            enableSort={true}
            searchTerm={dbSearchTerm}
            onSearchChange={setDbSearchTerm}
            searchPlaceholder="Search"
            isLoading={dbIsLoading}
            error={dbError}
            itemsPerPage={20}
            enableStatusFilter={false}
            showCreateButton={false}
            showBackButton={false}
            className="compact-table"
            createButton={{ show: false, label: "", onClick: () => {} }}
            counts={{
              total: dbStatsData.summary.total_tables,
              active: null,
              inactive: null,
            }}
            dashboardTitle={`Total Records: ${dbStatsData.summary.total_records} | Tables With Data: ${dbStatsData.summary.tables_with_data} | Empty Tables: ${dbStatsData.summary.empty_tables}`}
            emptyStateMessage="No table statistics available."
          />
        </div>
      </div>
    </div>
  );
}

export default CombinedStats;
