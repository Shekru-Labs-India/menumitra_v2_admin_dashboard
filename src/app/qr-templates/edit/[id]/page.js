"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";
import {
  QrCode,
  Upload,
  X,
  ArrowLeft,
  Save,
  Loader2,
  FileImage,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { FiArrowLeftCircle } from "react-icons/fi"; // Add this import
import { templateService } from "@/api";
import Modal from "@/components/ui/Modal";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added import

export default function EditTemplate({ params }) {
  const router = useRouter();
  // Unwrap the params using React.use()
  const unwrappedParams = use(params);
  const templateId = unwrappedParams.id;

  const [name, setName] = useState("");
  const [position, setPosition] = useState("centre");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageName, setCurrentImageName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch template details
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        const template = await templateService.viewTemplate(templateId);

        if (template) {
          setName(template.name || "");
          setPosition(template.qr_overlay_position || "centre");
          setCurrentImageName(template.image_name || "");

          // Set the image preview if there's an existing image
          if (template.image_name) {
            setImagePreview(
              templateService.getTemplateImageUrl(template.image_name)
            );
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch template:", err);
        setError("Failed to load template details. Please try again.");

        // Set mock data for now
        setName("Classic Template");
        setPosition("centre");
        setCurrentImageName("template_example.jpg");
      } finally {
        setLoading(false);
      }
    }

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !position) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Make sure the template_id is a number
      const parsedTemplateId = parseInt(templateId, 10);
      if (isNaN(parsedTemplateId)) {
        throw new Error("Invalid template ID");
      }

      // Create the template data
      const templateData = {
        name: name,
        qr_overlay_position: position,
        template_id: parsedTemplateId, // Ensure this is correctly passed
      };

      // Add the image file if a new one was selected
      if (imageFile) {
        console.log("Including image file in update:", imageFile.name);
        templateData.image = imageFile;
      }

      console.log("Submitting template data:", templateData);

      // Update the template
      const result = await templateService.updateTemplate(templateData);
      console.log("Update result:", result);

      if (result && result.detail) {
        setError(result.detail);
        setSaving(false);
        return;
      }

      // Navigate back to templates list on success
      router.push("/qr-templates");
    } catch (err) {
      console.error("Failed to update template:", err);
      setError("Failed to update template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Process the selected file
  const handleFile = (file) => {
    // Check if file is an image
    if (!file.type.match("image.*")) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    setError(null);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Clear the selected image and revert to the original
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle delete template
  const handleDeleteTemplate = async () => {
    try {
      await templateService.deleteTemplate(templateId);
      router.push("/qr-templates");
    } catch (err) {
      console.error("Failed to delete template:", err);
      setError("Failed to delete template. Please try again.");
      setShowDeleteModal(false);
    }
  };

  // Render the delete confirmation content
  const renderDeleteConfirmation = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Confirm Deletion
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete this template? This action cannot be
            undone.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteTemplate}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-1 max-w-6xl mx-auto bg-gray-100">
        <div className="mb-0">
          <Breadcrumb />
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden -mt-5">
          {/* Page header skeleton */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center relative">
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex-1" />
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Form content skeleton */}
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form fields skeleton */}
              <div className="space-y-6">
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>

                <div>
                  <div className="h-4 w-36 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 w-full bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-32 w-full bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Image upload skeleton */}
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-64 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mt-2 animate-pulse"></div>
              </div>
            </div>

            {/* Form footer skeleton */}
            <div className="pt-4 mt-6 border-t border-gray-200 flex justify-between">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-1 max-w-6xl mx-auto bg-gray-100 ${
        showDeleteModal ? "blur-sm" : ""
      }`}
    >
      <div className="mb-0">
        <Breadcrumb />
      </div>

      {/* Single card container with reduced padding */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden -mt-5">
        {/* Page header with reduced padding */}
        <div className="px-4 py-3 flex items-center relative">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="mr-1" size={12} /> Back
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-gray-900">
            Edit Template
          </h1>
          <div className="flex-1" />
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <Trash2 className="mr-1.5 h-3 w-3 text-white" />
            Delete
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form content with reduced padding */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form fields */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[12px] font-medium text-gray-700 mb-1"
                >
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Classic, Modern, Elegant"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-[12px] text-gray-900 focus:ring-gray-700 focus:border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">
                  QR Code Position <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`relative flex items-center justify-center p-4 border ${
                      position === "centre"
                        ? "border-gray-800 bg-gray-50"
                        : "border-gray-300"
                    } rounded-md cursor-pointer transition-colors duration-200 hover:bg-gray-50`}
                  >
                    <input
                      type="radio"
                      name="position"
                      value="centre"
                      checked={position === "centre"}
                      onChange={() => setPosition("centre")}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                        <QrCode
                          size={24}
                          className={
                            position === "centre"
                              ? "text-gray-800"
                              : "text-gray-400"
                          }
                        />
                      </div>
                      <span
                        className={`text-[12px] font-medium ${
                          position === "centre"
                            ? "text-gray-800"
                            : "text-gray-700"
                        }`}
                      >
                        Center
                      </span>
                    </div>
                    {position === "centre" && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-800 rounded-full"></div>
                    )}
                  </label>

                  <label
                    className={`relative flex items-center justify-center p-4 border ${
                      position === "top"
                        ? "border-gray-800 bg-gray-50"
                        : "border-gray-300"
                    } rounded-md cursor-pointer transition-colors duration-200 hover:bg-gray-50`}
                  >
                    <input
                      type="radio"
                      name="position"
                      value="top"
                      checked={position === "top"}
                      onChange={() => setPosition("top")}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto border-2 border-dashed border-gray-300 relative mb-2">
                        <div className="absolute top-1 left-0 right-0 flex justify-center">
                          <QrCode
                            size={24}
                            className={
                              position === "top"
                                ? "text-gray-800"
                                : "text-gray-400"
                            }
                          />
                        </div>
                      </div>
                      <span
                        className={`text-[12px] font-medium ${
                          position === "top" ? "text-gray-800" : "text-gray-700"
                        }`}
                      >
                        Top
                      </span>
                    </div>
                    {position === "top" && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-800 rounded-full"></div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Template Image
              </label>

              {imagePreview ? (
                <div className="relative rounded-md overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Template preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    <X size={18} className="text-gray-700" />
                  </button>
                  <div className="p-3 bg-gray-50 text-[12px] text-gray-500 flex justify-between items-center">
                    {imageFile ? (
                      <>
                        <span>{imageFile.name}</span>
                        <span>{(imageFile.size / 1024).toFixed(1)} KB</span>
                      </>
                    ) : (
                      <span>Current image: {currentImageName}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed ${
                    dragActive
                      ? "border-gray-800 bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  } rounded-md p-6 transition-colors duration-200 flex flex-col items-center justify-center h-64 cursor-pointer`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center text-center">
                    <FileImage
                      size={48}
                      className={`mb-3 ${
                        dragActive ? "text-gray-800" : "text-gray-400"
                      }`}
                    />
                    <p className="text-[12px] text-gray-700 font-medium mb-1">
                      Drag and drop your image here
                    </p>
                    <p className="text-[12px] text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <p className="text-[12px] text-gray-400">
                      PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-2 text-[12px] text-gray-500">
                Leave unchanged to keep the current image
              </p>
            </div>
          </div>

          {/* Form footer with modified button alignment */}
          <div className="pt-4 mt-6 flex justify-between">
            {/* Cancel button moved to left */}
            <button
              type="button"
              onClick={() => router.push("/qr-templates")}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>

            {/* Save button on right */}
            <button
              type="submit"
              disabled={saving}
              className={`px-3 py-1.5 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white inline-flex items-center justify-center ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
              } transition-colors duration-200`}
            >
              {saving ? (
                <>
                  <Loader2 size={12} className="mr-1.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} className="mr-1.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Keep modal outside card container */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
}
