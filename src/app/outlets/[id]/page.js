"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit,
  FiArrowLeft,
  FiClock,
  FiPercent,
  FiFileText,
  FiCreditCard,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiCoffee,
  FiMessageCircle,
} from "react-icons/fi";
import outletService from "@/api/services/outletService";
import tokenService from "@/services/tokenService";
import { isAuthenticated } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumb";

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Info Item component with label below value
const InfoItem = ({
  icon: Icon,
  label,
  value,
  iconClass = "text-indigo-600",
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-center mb-1">
      <Icon className={`mr-2 ${iconClass}`} size={14} />
      <span className="text-xs font-semibold text-gray-900">
        {value ? value : "-"}
      </span>
    </div>
    <div className="text-xs font-medium text-gray-500 pl-6">{label}</div>
  </div>
);

// Status badge component
const StatusBadge = ({ status, type }) => {
  const isActive = status === 1;
  const label = type === "outlet_status" ? "Active" : "Open";
  const inactiveLabel = type === "outlet_status" ? "Inactive" : "Closed";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      {isActive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
          {label}
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></span>
          {inactiveLabel}
        </>
      )}
    </span>
  );
};

const OutletCard = ({ outlet }) => (
  <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-gray-900">{outlet.name}</h2>
      <StatusBadge status={outlet.status} className="text-xs" />
    </div>
    <div className="space-y-2">
      <div className="flex items-center text-xs text-gray-600">
        <FiMapPin size={14} className="mr-2 text-gray-400" />
        <span>{outlet.address}</span>
      </div>
      <div className="flex items-center text-xs text-gray-600">
        <FiPhone size={14} className="mr-2 text-gray-400" />
        <span>{outlet.phone}</span>
      </div>
      <div className="flex items-center text-xs text-gray-600">
        <FiMail size={14} className="mr-2 text-gray-400" />
        <span>{outlet.email}</span>
      </div>
    </div>
  </div>
);

export default function ViewOutletPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }
    fetchOutletDetails();
  }, [router, params.id]);

  const fetchOutletDetails = async () => {
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;

      const data = await outletService.viewOutlet(params.id, userId);
      setOutlet(data);
    } catch (error) {
      console.error("Failed to fetch outlet details:", error);
      toast.error("Failed to load outlet details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Breadcrumb />
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="pl-6">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="p-2 bg-gray-50 min-h-screen">
        <div className="mb-2">
          <Breadcrumb />
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <FiAlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Outlet Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The outlet you are looking for could not be found or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => router.push("/outlets")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Outlets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 bg-gray-50 min-h-screen">
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Outlet Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 -mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-1" size={12} /> Back
            </button>
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-base font-semibold text-gray-900">
              {outlet.name}
            </h2>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <button
              onClick={() => router.push(`/outlets/${params.id}/edit`)}
              className="inline-flex items-center justify-center w-full px-3 py-1 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
            >
              <FiEdit className="mr-1" size={12} />
              Edit
            </button>
            <div className="flex space-x-1">
              <StatusBadge status={outlet.outlet_status} type="outlet_status" />
              <StatusBadge status={outlet.is_open} type="is_open" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
      {/* Staff Count */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Manage Staff Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem icon={FiUser} label="Waiters" value={outlet.waiter_count} />
          <InfoItem icon={FiUser} label="Chefs" value={outlet.chef_count} />
          <InfoItem icon={FiUser} label="Captains" value={outlet.captain_count} />
          <InfoItem icon={FiUser} label="Managers" value={outlet.manager_count} />
        </div>
      </div>

      {/* Outlet Counts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Manage Outlet Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem icon={FiLayers} label="Menus" value={outlet.menu_count} />
          <InfoItem icon={FiTag} label="Categories" value={outlet.category_count} />
          <InfoItem icon={FiFileText} label="Sections" value={outlet.section_count} />
          <InfoItem icon={FiCreditCard} label="Orders" value={outlet.orders_count} />
          <InfoItem icon={FiCreditCard} label="Tables" value={outlet.table_count} />
        </div>
      </div>
    </div>

    <div className="p-6 space-y-8">
      {/* Basic Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem
            icon={FiShoppingBag}
            label="Outlet Name"
            value={outlet.name}
          />
          <InfoItem icon={FiMail} label="Email Address" value={outlet.email} />
          <InfoItem
            icon={FiPhone}
            label="Mobile Number"
            value={outlet.mobile}
          />
          <InfoItem icon={FiMapPin} label="Address" value={outlet.address} />
          <InfoItem
            icon={FiMessageCircle}
            label="WhatsApp"
            value={outlet.whatsapp}
          />
          <InfoItem
            icon={FiCoffee}
            label="Outlet Type"
            value={outlet.outlet_type}
          />
        </div>
      </div>
    </div>

    <div className="p-6 space-y-8">
      {/* Business Details */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Business Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem
            icon={FiLayers}
            label="Food Type"
            value={outlet.veg_nonveg?.toUpperCase()}
          />
          <InfoItem
            icon={FiPercent}
            label="Service Charges"
            value={`${outlet.service_charges || 0}%`}
          />
          <InfoItem
            icon={FiDollarSign}
            label="GST"
            value={`${outlet.gst || 0}%`}
          />
          <InfoItem
            icon={FiClock}
            label="Opening Hours"
            value={
              outlet.opening_time
                ? outlet.opening_time.split(" ")[1] +
                  " " +
                  (outlet.opening_time.split(" ")[2] || "")
                : "Not specified"
            }
          />
          <InfoItem
            icon={FiClock}
            label="Closing Hours"
            value={
              outlet.closing_time
                ? outlet.closing_time.split(" ")[1] +
                  " " +
                  (outlet.closing_time.split(" ")[2] || "")
                : "Not specified"
            }
          />
          <InfoItem
            icon={FiCheckCircle}
            label="Outlet Status"
            value={outlet.outlet_status === 1 ? "Active" : "Inactive"}
            iconClass={
              outlet.outlet_status === 1 ? "text-green-600" : "text-red-600"
            }
          />
          <InfoItem
            icon={outlet.is_open === 1 ? FiCheckCircle : FiXCircle}
            label="Currently"
            value={outlet.is_open === 1 ? "Open" : "Closed"}
            iconClass={outlet.is_open === 1 ? "text-green-600" : "text-red-600"}
          />
          <InfoItem
            icon={FiFileText}
            label="FSSAI Number"
            value={outlet.fssainumber}
          />
          <InfoItem icon={FiTag} label="GST Number" value={outlet.gstnumber} />
          <InfoItem icon={FiCreditCard} label="UPI ID" value={outlet.upi_id} />
        </div>
      </div>
    </div>

    <div className="p-6 space-y-8">
      {/* Audit Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Audit Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem
            icon={FiCalendar}
            label="Created On"
            value={formatDate(outlet.created_on)}
          />
          <InfoItem
            icon={FiUser}
            label="Created By"
            value={outlet.created_by}
          />
          {outlet.updated_on && (
            <>
              <InfoItem
                icon={FiCalendar}
                label="Updated On"
                value={formatDate(outlet.updated_on)}
              />
              <InfoItem
                icon={FiUser}
                label="Updated By"
                value={outlet.updated_by}
              />
            </>
          )}
        </div>
      </div>    
    </div>  
    </div>
  );
}

export function ErrorState({ error }) {
  return (
    <div className="text-center py-8">
      <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        Error Loading Outlet
      </h3>
      <p className="text-xs text-gray-600">{error.message}</p>
    </div>
  );
}
