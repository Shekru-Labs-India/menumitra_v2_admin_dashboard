"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiPercent,
  FiHash,
  FiInfo,
  FiArrowLeft,
  FiImage,
  FiUser,
  FiDollarSign,
} from "react-icons/fi";
import outletService from "@/api/services/outletService";
import commonService from "@/api/services/commonService";
import ownerService from "@/api/services/ownerService";
import tokenService from "@/services/tokenService";
import { isAuthenticated } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumb";

export default function CreateOutletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [owners, setOwners] = useState([]);
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
    opening_time: "",
    closing_time: "",
    owner_id: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Check authentication and fetch dropdowns on component mount
  React.useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      router.push("/auth/login");
      return;
    }

    // Fetch dropdown options
    fetchOutletTypes();
    fetchFoodTypes();
    fetchOwners();
  }, [router]);

  // Fetch outlet types from API
  const fetchOutletTypes = async () => {
    try {
      const response = await commonService.getOutletTypes();
      if (response?.outlet_type_list) {
        setOutletTypes(response.outlet_type_list);
        // Set default value to first item if available
        if (Object.keys(response.outlet_type_list).length > 0) {
          setFormData((prev) => ({
            ...prev,
            outlet_type: Object.keys(response.outlet_type_list)[0],
          }));
        }
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
        // Set default value to first item if available
        if (Object.keys(response.food_type_list).length > 0) {
          setFormData((prev) => ({
            ...prev,
            veg_nonveg: Object.keys(response.food_type_list)[0],
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch food types:", error);
      toast.error("Failed to load food types");
    }
  };

  // Fetch owners list
  const fetchOwners = async () => {
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;

      const response = await ownerService.listOwners(userId);
      if (Array.isArray(response)) {
        setOwners(response);
        // Set default owner if available
        if (response.length > 0) {
          setFormData((prev) => ({
            ...prev,
            owner_id: response[0].user_id.toString(),
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch owners:", error);
      toast.error("Failed to load owners");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information Validation
    if (!formData.name?.trim()) {
      newErrors.name = "Outlet name is required";
    }

    if (!formData.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.owner_id) {
      newErrors.owner_id = "Owner selection is required";
    }

    // Business Details Validation
    if (!formData.outlet_type) {
      newErrors.outlet_type = "Outlet type is required";
    }

    if (!formData.veg_nonveg) {
      newErrors.veg_nonveg = "Food type is required";
    }

    // Validate time formats if provided
    if (
      formData.opening_time &&
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.opening_time)
    ) {
      newErrors.opening_time = "Invalid opening time format";
    }

    if (
      formData.closing_time &&
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.closing_time)
    ) {
      newErrors.closing_time = "Invalid closing time format";
    }

    // Validate numeric fields
    if (
      formData.service_charges &&
      (isNaN(formData.service_charges) ||
        formData.service_charges < 0 ||
        formData.service_charges > 100)
    ) {
      newErrors.service_charges = "Service charges must be between 0 and 100";
    }

    if (
      formData.gst &&
      (isNaN(formData.gst) || formData.gst < 0 || formData.gst > 100)
    ) {
      newErrors.gst = "GST must be between 0 and 100";
    }

    // Validate URLs if provided
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    if (formData.facebook && !isValidUrl(formData.facebook)) {
      newErrors.facebook = "Please enter a valid Facebook URL";
    }

    if (formData.instagram && !isValidUrl(formData.instagram)) {
      newErrors.instagram = "Please enter a valid Instagram URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to validate URLs
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors({
          ...errors,
          image: null,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show all validation errors
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        toast.error(errorMessages[0]); // Show first error message
      }
      return;
    }

    setLoading(true);

    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();

      // Get user data from token service
      const userData = tokenService.getUserData();
      const userId = userData?.id || localStorage.getItem("userId") || 1;

      // Process form data before sending
      const processedFormData = { ...formData };

      // Format times if they exist
      if (processedFormData.opening_time) {
        // Convert to 24-hour format if needed
        const [hours, minutes] = processedFormData.opening_time.split(":");
        processedFormData.opening_time = `${hours.padStart(2, "0")}:${minutes}`;
      }

      if (processedFormData.closing_time) {
        // Convert to 24-hour format if needed
        const [hours, minutes] = processedFormData.closing_time.split(":");
        processedFormData.closing_time = `${hours.padStart(2, "0")}:${minutes}`;
      }

      // Append all form fields including the image
      Object.keys(processedFormData).forEach((key) => {
        if (key === "image") {
          if (processedFormData[key]) {
            formDataObj.append(key, processedFormData[key]);
          }
        } else {
          formDataObj.append(key, processedFormData[key]);
        }
      });

      // Add app_source
      formDataObj.append("app_source", "admin_dashboard");

      const response = await outletService.createOutlet(formDataObj, userId);
      console.log("Outlet creation response:", response);

      if (response.detail && response.detail.includes("successfully")) {
        toast.success("Outlet created successfully");
        router.push("/outlets");
      } else if (response.detail) {
        toast.error(response.detail);
      } else {
        toast.success("Outlet created successfully");
        router.push("/outlets");
      }
    } catch (error) {
      console.error("Failed to create outlet:", error);
      toast.error(
        "Failed to create outlet: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 bg-gray-100">
      {/* Breadcrumb */}
      <div className="mb-0">
        <Breadcrumb />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 -mt-5">
        <div className="p-2 flex items-center relative">
          <button
            type="button"
            onClick={() => router.push("/outlets")}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-2xl shadow-sm text-[12px] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            <FiArrowLeft className="mr-1" size={12} />
            Back
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-gray-900">
            Create Outlet
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                <FiInfo className="mr-2 text-gray-700" size={12} />
                Basic Information
              </h4>

              {/* Grid layout for form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload - Left Side */}
                <div className="col-span-1">
                  <label
                    htmlFor="image"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Outlet Image
                  </label>
                  <div
                    className={`flex justify-center items-center px-6 pt-5 pb-6 border-2 ${
                      errors.image ? "border-red-300" : "border-gray-300"
                    } border-dashed rounded-md w-full bg-white hover:bg-gray-50 transition-colors duration-200`}
                  >
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative w-full h-40 mb-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({ ...formData, image: null });
                            }}
                            className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors duration-200"
                            title="Remove image"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-gray-700 hover:text-gray-500 focus-within:outline-none"
                        >
                          <span>
                            {imagePreview ? "Change image" : "Upload a file"}
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        {!imagePreview && (
                          <p className="pl-1">or drag and drop</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-xs text-red-600">{errors.image}</p>
                  )}
                </div>

                {/* Three Fields in One Line - Right Side */}
                <div className="col-span-1">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Outlet Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                          placeholder="Enter outlet name"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="mobile"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Mobile <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          maxLength={10}
                          className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                          placeholder="Enter mobile"
                        />
                      </div>
                      {errors.mobile && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="owner_id"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Owner <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <select
                          id="owner_id"
                          name="owner_id"
                          value={formData.owner_id}
                          onChange={handleInputChange}
                          className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                          <option value="">Select Owner</option>
                          {owners.map((owner) => (
                            <option
                              key={owner.user_id}
                              value={owner.user_id.toString()}
                            >
                              {owner.name}{" "}
                              {owner.is_active ? "(Active)" : "(Inactive)"}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.owner_id && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.owner_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <FiMapPin className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                        placeholder="Enter complete address"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                <FiHash className="mr-2 text-gray-700" size={12} />
                Business Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label
                    htmlFor="outlet_type"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Outlet Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      id="outlet_type"
                      name="outlet_type"
                      value={formData.outlet_type}
                      onChange={handleInputChange}
                      className="block w-full py-1.5 px-3 border border-gray-300 rounded-md text-xs text-gray-900 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <option value="">Select Outlet Type</option>
                      {Object.entries(outletTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.outlet_type && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.outlet_type}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="veg_nonveg"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Food Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      id="veg_nonveg"
                      name="veg_nonveg"
                      value={formData.veg_nonveg}
                      onChange={handleInputChange}
                      className="block w-full py-1.5 px-3 border border-gray-300 rounded-md text-xs text-gray-900 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <option value="">Select Food Type</option>
                      {Object.entries(foodTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.veg_nonveg && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.veg_nonveg}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="service_charges"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Service Charges (%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-3.5 w-3.5 text-gray-400" />
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
                      className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                      placeholder="Enter service charges"
                    />
                  </div>
                  {errors.service_charges && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.service_charges}
                    </p>
                  )}
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
                      <FiPercent className="h-3.5 w-3.5 text-gray-400" />
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
                      className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                      placeholder="Enter GST percentage"
                    />
                  </div>
                  {errors.gst && (
                    <p className="mt-1 text-xs text-red-600">{errors.gst}</p>
                  )}
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
                      <FiClock className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="opening_time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleInputChange}
                      className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="09:00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Format: 24-hour (HH:MM)
                  </p>
                  {errors.opening_time && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.opening_time}
                    </p>
                  )}
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
                      <FiClock className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="closing_time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleInputChange}
                      className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white hover:bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="21:00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Format: 24-hour (HH:MM)
                  </p>
                  {errors.closing_time && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.closing_time}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                <FiInfo className="mr-2 text-gray-700" size={12} />
                Additional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
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
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="whatsapp"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                    placeholder="Enter WhatsApp number"
                  />
                </div>

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
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                    placeholder="Enter website URL"
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
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                    placeholder="Enter Facebook URL"
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
                    className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400"
                    placeholder="Enter Instagram URL"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 mt-6 border-t border-gray-200 flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push("/outlets")}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
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
                  Creating...
                </span>
              ) : (
                "Create Outlet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
