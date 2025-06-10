"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowLeft,
  FiInfo,
  FiPercent,
  FiHash,
  FiClock,
  FiDollarSign,
  FiGlobe,
  FiUser,
  FiImage,
} from "react-icons/fi";
import outletService from "@/api/services/outletService";
import commonService from "@/api/services/commonService";
import { isAuthenticated } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumb";

// Function to convert API time format to HTML time input format (HH:MM)
const apiTimeToInputTime = (apiTime) => {
  if (!apiTime) return "";

  try {
    // Parse the API time format (e.g., "2024-01-01 10:00:00 AM")
    const timePart = apiTime.split(" ");
    if (timePart.length < 3) return "";

    const timeValue = timePart[1]; // "10:00:00"
    const ampm = timePart[2]; // "AM" or "PM"

    // Extract hours and minutes
    const [hours, minutes] = timeValue.split(":");

    // Convert to 24-hour format for HTML time input
    let hour24 = parseInt(hours);
    if (ampm === "PM" && hour24 < 12) {
      hour24 += 12;
    } else if (ampm === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    // Format as HH:MM for HTML time input
    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  } catch (error) {
    console.error("Error parsing API time:", error);
    return "";
  }
};

// Function to convert HTML time input (HH:MM) to API time format
const inputTimeToApiTime = (inputTime) => {
  if (!inputTime) return "";

  try {
    // Parse the HTML time input format (HH:MM in 24-hour)
    const [hours, minutes] = inputTime.split(":");
    const hour = parseInt(hours);

    // Determine AM/PM
    const ampm = hour >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    let hour12 = hour % 12;
    if (hour12 === 0) hour12 = 12;

    // Format as API time format (use current date as placeholder)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return `${today} ${hour12}:${minutes}:00 ${ampm}`;
  } catch (error) {
    console.error("Error formatting time for API:", error);
    return "";
  }
};

export default function EditOutletPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    outlet_type: "",
    veg_nonveg: "",
    service_charges: "",
    gst: "",
    upi_id: "",
    fssainumber: "",
    gstnumber: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    website: "",
    google_business_link: "",
    google_review: "",
    opening_time: "",
    closing_time: "",
    is_open: 1,
    outlet_status: 1,
    image: null,
  });

  // Check authentication and fetch outlet details on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }

    // Fetch dropdown options and outlet details
    Promise.all([fetchOutletTypes(), fetchFoodTypes(), fetchOutletDetails()]);
  }, [router, params.id]);

  // Fetch outlet types from API
  const fetchOutletTypes = async () => {
    try {
      const response = await commonService.getOutletTypes();
      if (response?.outlet_type_list) {
        setOutletTypes(response.outlet_type_list);
      }
    } catch (error) {
      console.error("Failed to fetch outlet types:", error);
      toast.error("Failed to load outlet types");
    }
  };

  // Fetch food types from API
  const fetchFoodTypes = async () => {
    try {
      const response = await commonService.getFoodTypes();
      if (response?.food_type_list) {
        setFoodTypes(response.food_type_list);
      }
    } catch (error) {
      console.error("Failed to fetch food types:", error);
      toast.error("Failed to load food types");
    }
  };

  const fetchOutletDetails = async () => {
    try {
      const data = await outletService.viewOutlet(params.id);
      console.log("Outlet data from API:", data);

      // Format time values for the input fields
      const formattedData = { ...data };

      // Convert API time format to HTML time input format
      if (formattedData.opening_time) {
        formattedData.opening_time = apiTimeToInputTime(
          formattedData.opening_time
        );
      }

      if (formattedData.closing_time) {
        formattedData.closing_time = apiTimeToInputTime(
          formattedData.closing_time
        );
      }

      setFormData(formattedData);
      if (formattedData.image) {
        setImagePreview(formattedData.image);
      }
    } catch (error) {
      console.error("Failed to fetch outlet details:", error);
      toast.error("Failed to load outlet details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0,
      });
    } else if (type === "time") {
      // For time inputs, store the value as is (already in HH:MM format)
      setFormData({
        ...formData,
        [name]: value, // HTML time inputs are in HH:MM format which matches API needs
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create an object with only the fields specified in the API structure
      const updateData = {
        outlet_id: parseInt(params.id),
        user_id: 2,
        name: formData.name,
        outlet_type: formData.outlet_type,
        fssainumber: formData.fssainumber,
        gstnumber: formData.gstnumber,
        mobile: formData.mobile,
        veg_nonveg: formData.veg_nonveg,
        service_charges: formData.service_charges,
        gst: formData.gst,
        address: formData.address,
        is_open: formData.is_open,
        outlet_status: formData.outlet_status,
        upi_id: formData.upi_id,
        website: formData.website,
        whatsapp: formData.whatsapp,
        facebook: formData.facebook,
        instagram: formData.instagram,
        google_business_link: formData.google_business_link,
        google_review: formData.google_review,
      };

      // Only include time fields if they are provided and convert to API format
      if (formData.opening_time && formData.opening_time.trim() !== "") {
        updateData.opening_time = inputTimeToApiTime(formData.opening_time);
      }

      if (formData.closing_time && formData.closing_time.trim() !== "") {
        updateData.closing_time = inputTimeToApiTime(formData.closing_time);
      }

      console.log("Sending update data:", updateData);

      // Use the outletService to update the outlet
      await outletService.updateOutlet(updateData);

      toast.success("Outlet updated successfully");
      router.push(`/outlets/${params.id}`);
    } catch (error) {
      console.error("Failed to update outlet:", error);
      toast.error(
        "Failed to update outlet: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-1 max-w-7xl mx-auto bg-gray-100">
        {/* Add Breadcrumb here */}
        <div className="mb-0">
          <Breadcrumb />
        </div>
        <div className="mb-8 flex items-center justify-between -mt-5">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 -mt-5">
          <div className="px-6 py-5 border-b border-gray-200 bg-white">
            <div className="animate-pulse">
              <div className="h-5 w-36 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="space-y-8">
              {/* Basic Information Section Skeleton */}
              <div className="bg-white p-5 rounded-lg shadow-sm  border-gray-200">
                <div className="animate-pulse">
                  <div className="h-5 w-36 bg-gray-300 rounded mb-4 pb-2 "></div>

                  {/* Image Upload Skeleton */}
                  <div className="mb-6 flex items-start space-x-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-md"></div>
                    <div className="flex flex-col">
                      <div className="h-8 w-28 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 w-36 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="col-span-1">
                        <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Details Section Skeleton */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-5 w-36 bg-gray-300 rounded mb-4 pb-2 border-b"></div>
                  <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="col-span-1">
                        <div className="h-4 w-28 bg-gray-300 rounded mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media Section Skeleton */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-5 w-48 bg-gray-300 rounded mb-4 pb-2 border-b"></div>
                  <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="col-span-1">
                        <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outlet Status Section Skeleton */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-5 w-32 bg-gray-300 rounded mb-4 pb-2 border-b"></div>
                  <div className="grid grid-cols-4 gap-6">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="col-span-1 flex items-center">
                        <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
                        <div className="h-4 w-40 bg-gray-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-gray-200 flex justify-end space-x-3">
              <div className="animate-pulse flex space-x-3">
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 max-w-6xl mx-auto bg-gray-100">
      {/* Add Breadcrumb here */}
      <div className="mb-0">
        <Breadcrumb />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 -mt-5">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white p-5 shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
                >
                  <FiArrowLeft className="mr-1" size={12} /> Back
                </button>
                <div className="flex-1 text-center">
                  <h1 className="text-base font-semibold text-gray-800">
                    Edit Outlet
                  </h1>
                </div>
                <div className="w-[100px]"></div>
              </div>

              <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center  pb-2">
                <FiInfo className="mr-2 text-gray-700" size={12} />
                Basic Information
              </h4>

              <div className="grid grid-cols-6 gap-6">
                {/* Image Upload Section - Left Side */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outlet Image
                  </label>
                  <div className="flex flex-col space-y-4">
                    <label
                      htmlFor="outlet-image"
                      className="w-full h-32 border-2 border-gray-300 border-dashed rounded-md overflow-hidden relative bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Outlet preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <FiImage className="h-12 w-12 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Click to select image
                          </span>
                        </div>
                      )}
                      <input
                        id="outlet-image"
                        name="image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, or GIF up to 5MB
                    </p>
                  </div>
                </div>

                {/* Right Side - 3 columns in 2 lines */}
                <div className="col-span-4">
                  <div className="grid grid-cols-3 gap-4 h-40">
                    {/* First Line */}
                    <div className="flex flex-col justify-between h-full">
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Outlet Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 placeholder-gray-400"
                          placeholder="Enter name"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between h-full">
                      <label
                        htmlFor="mobile"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 placeholder-gray-400"
                          placeholder="Enter mobile number"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between h-full">
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Email Address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 placeholder-gray-400"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* Second Line */}
                    <div className="flex flex-col justify-between h-full">
                      <label
                        htmlFor="outlet_type"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Outlet Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <select
                          id="outlet_type"
                          name="outlet_type"
                          value={formData.outlet_type}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900"
                          required
                        >
                          <option value="">Select Outlet Type</option>
                          {Object.entries(outletTypes).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between h-full">
                      <label
                        htmlFor="veg_nonveg"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Food Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <select
                          id="veg_nonveg"
                          name="veg_nonveg"
                          value={formData.veg_nonveg}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900"
                          required
                        >
                          <option value="">Select Food Type</option>
                          {Object.entries(foodTypes).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between h-full">
                      <label
                        htmlFor="upi_id"
                        className="block text-xs font-medium text-gray-700"
                      >
                        UPI ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiDollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="upi_id"
                          name="upi_id"
                          value={formData.upi_id}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 placeholder-gray-400"
                          placeholder="Enter UPI ID"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Field - Half Width */}
                <div className="col-span-3">
                  <label
                    htmlFor="address"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 placeholder-gray-400"
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                <FiHash className="mr-2 text-gray-700" />
                Business Details
              </h4>
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label
                    htmlFor="service_charges"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Service Charges (%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="service_charges"
                      name="service_charges"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.service_charges}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="gst"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    GST (%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="gst"
                      name="gst"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.gst}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="opening_time"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Opening Time
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="opening_time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Format: 24-hour (HH:MM)
                  </p>
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="closing_time"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Closing Time
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="closing_time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Format: 24-hour (HH:MM)
                  </p>
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="fssainumber"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    FSSAI Number
                  </label>
                  <input
                    type="text"
                    id="fssainumber"
                    name="fssainumber"
                    value={formData.fssainumber}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="Enter FSSAI number"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="gstnumber"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    GST Number
                  </label>
                  <input
                    type="text"
                    id="gstnumber"
                    name="gstnumber"
                    value={formData.gstnumber}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="Enter GST number"
                  />
                </div>
              </div>
            </div>

            {/* Social Media & Web Presence Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center  pb-2">
                <FiGlobe className="mr-2 text-gray-700" />
                Social Media & Web Presence
              </h4>
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label
                    htmlFor="website"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="whatsapp"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://wa.me/yourphonenumber"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="facebook"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="instagram"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="google_business_link"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Google Business Link
                  </label>
                  <input
                    type="url"
                    id="google_business_link"
                    name="google_business_link"
                    value={formData.google_business_link}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://business.google.com/yourpage"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="google_review"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Google Review Link
                  </label>
                  <input
                    type="url"
                    id="google_review"
                    name="google_review"
                    value={formData.google_review}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://g.page/r/yourreviewpage"
                  />
                </div>
              </div>
            </div>

            {/* Outlet Status Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center  pb-2">
                <FiUser className="mr-2 text-gray-700" />
                Outlet Status
              </h4>
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-1">
                  <div className="flex items-center">
                    <input
                      id="is_open"
                      name="is_open"
                      type="checkbox"
                      checked={formData.is_open === 1}
                      onChange={handleInputChange}
                      className="h-4 w-4 border-gray-300 rounded text-gray-900 focus:ring-gray-700"
                    />
                    <label
                      htmlFor="is_open"
                      className="ml-2 block text-xs font-medium text-gray-700"
                    >
                      Outlet is currently open
                    </label>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center">
                    <input
                      id="outlet_status"
                      name="outlet_status"
                      type="checkbox"
                      checked={formData.outlet_status === 1}
                      onChange={handleInputChange}
                      className="h-3.5 w-3.5 border-gray-300 rounded text-gray-900 focus:ring-gray-700"
                    />
                    <label
                      htmlFor="outlet_status"
                      className="ml-2 block text-xs font-medium text-gray-700"
                    >
                      Outlet is active
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={() => router.push(`/outlets/${params.id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-blue-300"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
