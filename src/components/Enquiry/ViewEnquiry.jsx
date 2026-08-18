import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUser,
  faPhone,
  faLocationDot,
  faMapMarkerAlt,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faCalendarCheck,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import { useAuth } from "../../hooks/useAuth";

function ViewEnquiry() {
  const { enquiry_id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEnquiry() {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) throw new Error("No authentication token available");
        const response = await axios.post(
          "https://menu4.xyz/v2/common/view_enquiry",
          { enquiry_id: Number(enquiry_id) },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && response.data.data) {
          setEnquiry(response.data.data);
          setError(null);
        } else {
          setError("No enquiry details found.");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch enquiry details.");
      } finally {
        setLoading(false);
      }
    }
    fetchEnquiry();
  }, [enquiry_id]);

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Enquiries", path: "/enquiries" },
    { label: "View Enquiry" },
  ];

  if (!enquiry && loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }
  if (!enquiry) {
    return <div className="p-6 text-center">No enquiry found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try {
                    if (window.history && window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate("/enquiries");
                    }
                  } catch (e) {
                    navigate("/enquiries");
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover shadow-theme-xs"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Enquiry Details
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-4">
            {/* Hotel Information Card */}
            <h2 className="text-base font-medium mb-4 text-gray-800">
              Hotel Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Hotel Name */}
              {enquiry.hotel_name && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.hotel_name}
                    </div>
                    <div className="text-sm text-gray-500">Hotel Name</div>
                  </div>
                </div>
              )}

              {/* Owner Name */}
              {enquiry.owner_name && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.owner_name}
                    </div>
                    <div className="text-sm text-gray-500">Owner Name</div>
                  </div>
                </div>
              )}

              {/* Owner Number */}
              {enquiry.owner_number && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.owner_number}
                    </div>
                    <div className="text-sm text-gray-500">Owner Number</div>
                  </div>
                </div>
              )}

              {/* Location */}
              {enquiry.location && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.location}
                    </div>
                    <div className="text-sm text-gray-500">Location</div>
                  </div>
                </div>
              )}

              {/* Address */}
              {enquiry.address && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.address}
                    </div>
                    <div className="text-sm text-gray-500">Address</div>
                  </div>
                </div>
              )}

              {/* Hotel Mobile 1 */}
              {enquiry.hotel_mobile_1 && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.hotel_mobile_1}
                    </div>
                    <div className="text-sm text-gray-500">Hotel Mobile 1</div>
                  </div>
                </div>
              )}

              {/* Hotel Mobile 2 */}
              {enquiry.hotel_mobile_2 && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.hotel_mobile_2}
                    </div>
                    <div className="text-sm text-gray-500">Hotel Mobile 2</div>
                  </div>
                </div>
              )}

              {/* Previous Software Name */}
              {enquiry.previous_software_name && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.previous_software_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Previous Software
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Information Card */}
            <h2 className="text-base font-medium mb-4 text-gray-800 mt-8">
              Status Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Status */}
              {enquiry.enquiry_status && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={
                        enquiry.enquiry_status === "Active"
                          ? faCheckCircle
                          : faTimesCircle
                      }
                      className={`w-5 h-5 ${
                        enquiry.enquiry_status === "Active"
                          ? "text-success-500"
                          : "text-error-500"
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <div
                      className={`text-base font-medium ${
                        enquiry.enquiry_status === "Active"
                          ? "text-success-700"
                          : "text-error-700"
                      }`}
                    >
                      {enquiry.enquiry_status}
                    </div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                </div>
              )}

              {/* Enquiry Date */}
              {enquiry.enquiry_datetime && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.enquiry_datetime}
                    </div>
                    <div className="text-sm text-gray-500">Enquiry Date</div>
                  </div>
                </div>
              )}

              {/* Onboard Date */}
              {enquiry.onboard_datetime && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.onboard_datetime}
                    </div>
                    <div className="text-sm text-gray-500">Onboard Date</div>
                  </div>
                </div>
              )}

              {/* Next Discussion Reminder */}
              {enquiry.next_discussion_reminder_datetime && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBell}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.next_discussion_reminder_datetime}
                    </div>
                    <div className="text-sm text-gray-500">Next Discussion</div>
                  </div>
                </div>
              )}

              {/* Previous Software Expiry */}
              {enquiry.previous_software_expiry_date && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {enquiry.previous_software_expiry_date}
                    </div>
                    <div className="text-sm text-gray-500">Software Expiry</div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Logs Section */}
            {enquiry.status_logs && enquiry.status_logs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Status Logs
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                          Partner Name
                        </th>
                        <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                          Previous Status
                        </th>
                        <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                          New Status
                        </th>
                        <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                          Datetime
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiry.status_logs.map((log) => (
                        <tr
                          key={log.status_log_id}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-4 py-2">{log.partner_name}</td>
                          <td className="px-4 py-2">{log.previous_status}</td>
                          <td className="px-4 py-2">{log.new_status}</td>
                          <td className="px-4 py-2">{log.datetime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewEnquiry;
