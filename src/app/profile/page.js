"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCalendar,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import Link from "next/link";
import { isAuthenticated } from "@/utils/auth";
import tokenService from "@/services/tokenService";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added Breadcrumb import

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }

    // Get user data from token service
    const storedUserData = tokenService.getUserData();
    if (storedUserData) {
      setUserData(storedUserData);
    } else {
      setError("Could not retrieve user profile data");
    }
    setLoading(false);
  }, [router]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    // Check if the date is already formatted (e.g. "16 May 2025")
    if (dateString.includes(" ")) return dateString;

    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      {/* Reduce margin below breadcrumb */}
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Remove margin-bottom from header since it's empty */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between  -mt-5">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="mt-1 text-sm text-gray-600">View your account information</p>
        </div> */}
        {/* <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div> */}
      </div>

      {/* Error message - keep mb-6 for proper spacing when error shows */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start mb-6">
          <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-medium text-red-800 mb-1">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
          <h3 className="text-lg font-medium">Account Information</h3>
          <p className="mt-1 text-sm text-gray-300">Your personal details</p>
        </div> */}

        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="mb-6 md:mb-0 flex items-center justify-center w-full md:w-48 h-48 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : userData ? (
            <div className="space-y-8">
              {/* Profile header */}
              {/* <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="mb-6 md:mb-0">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <FiUser className="w-16 h-16 md:w-24 md:h-24 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                    {userData.role || 'User'}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {userData.name || 'User Name'}
                  </h2>
                  {userData.role === 'admin' && (
                    <div className="inline-block px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium mb-4">
                      Administrator
                    </div>
                  )}
                  <p className="text-gray-600">
                    Your account has administrator privileges, giving you full access to manage the entire system.
                  </p>
                </div>
              </div> */}

              {/* Profile details */}
              <div className=" border-gray-200 pt-6 text-[12px]">
                <h3 className="font-medium mb-4 text-gray-900">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <FiMail className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        Email Address
                      </div>
                      <div className="text-gray-700">
                        {userData.email || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <FiPhone className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        Mobile Number
                      </div>
                      <div className="text-gray-700">
                        {userData.mobile || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <FiShield className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Role</div>
                      <div className="text-gray-700 capitalize">
                        {userData.role || "-"}
                      </div>
                    </div>
                  </div>

                  {/* <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <FiCalendar className="h-5 w-5 text-gray-500" />
                      </div>
                    </div> */}
                  {/* <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Session Expires</div>
                      <div className="text-gray-700">{formatDate(userData.expires_at) || '-'}</div>
                    </div> */}
                  {/* </div> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No profile data available
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please try logging in again
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
