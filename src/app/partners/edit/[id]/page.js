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
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";
import partnerService from "@/api/services/partnerService";
import tokenService from "@/services/tokenService";
import { isAuthenticated } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumb";

export default function EditPartnerPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { id: partnerId } = unwrappedParams;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    aadhar_number: "",
    dob: "",
    is_active: true,
  });

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }

    // Fetch partner details
    if (mounted && partnerId) {
      fetchPartnerDetails();
    }
  }, [partnerId, router, mounted]);

  const fetchPartnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;

      const data = await partnerService.viewPartner(partnerId, userId);

      if (data.detail && typeof data.detail === "string" && !data.name) {
        // This is likely an error message
        setError(data.detail);
        setLoading(false);
        return;
      }

      // Format date to YYYY-MM-DD for input field
      let formattedData = { ...data };
      if (data.dob) {
        const date = new Date(data.dob);
        formattedData.dob = date.toISOString().split("T")[0];
      }

      setFormData(formattedData);
    } catch (error) {
      console.error("Failed to fetch partner details:", error);
      setError(error.message || "Failed to load partner details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;

      const updateData = {
        ...formData,
        update_user_id: parseInt(userId),
        user_id: parseInt(partnerId),
      };

      const response = await partnerService.updatePartner(updateData);

      if (response.detail && response.detail.includes("successfully")) {
        toast.success("Partner updated successfully");
        router.push("/partners");
      } else if (response.detail && !response.user_id) {
        // This is likely an error
        setError(response.detail || "Failed to update partner");
        setSubmitting(false);
      } else {
        toast.success("Partner updated successfully");
        router.push("/partners");
      }
    } catch (error) {
      console.error("Failed to update partner:", error);
      setError(error.message || "Failed to update partner");
      setSubmitting(false);
    }
  };

  const goBack = () => {
    router.push(`/partners/view/${partnerId}`);
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-5 rounded-lg border border-gray-200"
                >
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <FiAlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {/* <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            suppressHydrationWarning
          >
            <FiArrowLeft className="mr-2" />
            Back to Partner Details
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 bg-gray-50 min-h-screen">
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Form container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden -mt-5">
        {/* Card header with back button */}
        <div className="px-6 py-4  border-gray-200 bg-white flex items-center justify-between relative">
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                  >
                    <FiArrowLeft className="mr-1" size={12} />
                    Back
                  </button>
        
                  {/* Centered title */}
                  <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    Edit Partner
                  </h1>
        
                  {/* Placeholder div to balance layout */}
                  <div className="invisible">
                    <button className="px-2 py-1">Back</button>
                  </div>
                </div>

        <div className="p-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              suppressHydrationWarning
            >
              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Full Name
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
                      className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-xs text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter mobile number"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Aadhar Number */}
                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="aadhar_number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Aadhar Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="aadhar_number"
                      name="aadhar_number"
                      value={formData.aadhar_number || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter 12-digit Aadhar number"
                      pattern="[0-9]{12}"
                      title="Please enter a valid 12-digit Aadhar number"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-3 w-3 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_active"
                      className="ml-2 block text-xs text-gray-900"
                    >
                      Active Partner
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Partners marked as inactive will not be able to access the
                    system
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-start">
                  <FiAlertCircle
                    className="mr-1.5 mt-0.5 flex-shrink-0"
                    size={14}
                  />
                  <span className="text-xs">{error}</span>
                </div>
              )}

              <div className="pt-4  border-gray-200 mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  disabled={submitting}
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-colors"
                  suppressHydrationWarning
                >
                  {submitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <FiSave className="mr-1.5 h-3.5 w-3.5" />
                      Save Changes
                    </>
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
