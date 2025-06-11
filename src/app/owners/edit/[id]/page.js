"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiArrowLeft,
  FiSave,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import ownerService from "@/api/services/ownerService";
import tokenService from "@/services/tokenService";
import { isAuthenticated } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumb";

export default function EditOwnerPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const ownerId = unwrappedParams.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    aadhar_number: "",
    dob: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }

    fetchOwnerDetails();
  }, []);

  const fetchOwnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerDetails = await ownerService.viewOwner(ownerId);

      if (ownerDetails.detail && typeof ownerDetails.detail === "string") {
        // This is an error response from the API
        setError(ownerDetails.detail);
        setLoading(false);
        return;
      }

      // Format date for input field (YYYY-MM-DD)
      const formattedDate = ownerDetails.dob
        ? new Date(ownerDetails.dob).toISOString().split("T")[0]
        : "";

      setFormData({
        name: ownerDetails.name || "",
        mobile: ownerDetails.mobile || "",
        email: ownerDetails.email || "",
        address: ownerDetails.address || "",
        aadhar_number: ownerDetails.aadhar_number || "",
        dob: formattedDate,
      });
    } catch (error) {
      console.error("Failed to fetch owner details:", error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || "Failed to load owner details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get the admin's ID from token service
      const adminData = tokenService.getUserData();
      const adminId = adminData?.id;

      // If no admin ID is found, handle the error
      if (!adminId) {
        throw new Error('Admin ID not found. Please login again.');
      }

      // Get the owner details first to ensure we have the correct user_id
      const ownerDetails = await ownerService.viewOwner(ownerId);
      
      if (!ownerDetails || !ownerDetails.user_id) {
        throw new Error('Owner details not found');
      }

      const updateData = {
        update_user_id: adminId, // Admin who is making the update
        user_id: ownerDetails.user_id, // Use the actual owner's user_id from the API
        ...formData,
      };

      const response = await ownerService.updateOwner(updateData);

      if (response.detail) {
        if (response.detail.includes("success")) {
          toast.success(response.detail);
          router.push(`/owners/view/${ownerId}`);
        } else {
          // This is an error message from the API
          setError(response.detail);
          setSubmitting(false);
        }
        return;
      }

      toast.success("Owner updated successfully");
      router.push(`/owners/view/${ownerId}`);
    } catch (error) {
      console.error("Failed to update owner:", error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || "Failed to update owner");
      setSubmitting(false);
    }
  };

  const goBack = () => {
    // If there's an error, go back to the owners list instead of trying to view a non-existent owner
    if (error) {
      router.push("/owners");
    } else {
      router.push(`/owners/view/${ownerId}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gray-100 min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-gray-700 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-700">Loading owner details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-0">
        <Breadcrumb />
      </div>
      {/* Edit form card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden -mt-5 ">
        {/* Header with back button */}
        <div className="px-4 py-3  border-gray-200 flex items-center justify-between relative">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            <FiArrowLeft className="mr-1" size={12} />
            Back
          </button>

          {/* Centered heading */}
          <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
            Edit Owner
          </h1>

          {/* Empty div to maintain layout balance */}
          <div className="invisible">
            <button className="px-2 py-1">Back</button>
          </div>
        </div>

        <div className="p-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-start mb-4">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={14} />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Form content */}
          {!error && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label
                    htmlFor="mobile"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label
                    htmlFor="dob"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs text-gray-900 bg-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Aadhar Number */}
                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="aadhar_number"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Aadhar Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="aadhar_number"
                      name="aadhar_number"
                      value={formData.aadhar_number}
                      onChange={handleInputChange}
                      className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter 12-digit Aadhar number"
                      pattern="[0-9]{12}"
                      title="Please enter a valid 12-digit Aadhar number"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FiMapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6  border-gray-200 flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-200"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-xs">Saving...</span>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <FiSave className="h-3.5 w-3.5" />
                      <span className="ml-2 text-xs">Save Changes</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
