"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  QrCode,
  ArrowLeft,
  Edit2,
  Trash2,
  Download,
  Loader2,
  FileImage,
  AlertCircle,
  Calendar,
  LayoutTemplate,
} from "lucide-react";
import { templateService } from "@/api";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added import
import { FiArrowLeftCircle } from "react-icons/fi";

export default function ViewTemplate({ params }) {
  const router = useRouter();
  // Unwrap the params using React.use()
  const unwrappedParams = use(params);
  const templateId = unwrappedParams.id;

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch template details
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        const data = await templateService.viewTemplate(templateId);

        // Log the template data for debugging
        console.log("Template API response:", data);

        setTemplate(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch template:", err);
        setError("Failed to load template details. Please try again.");

        // Set mock data for now
        setTemplate({
          name: "Classic Template",
          qr_overlay_position: "centre",
          qr_code_template_id: templateId,
          image_name: "template_example.jpg",
          created_on: "30 Apr 2025",
        });
      } finally {
        setLoading(false);
      }
    }

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

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

  if (loading) {
    return (
      <div className="p-1 max-w-7xl mx-auto bg-gray-100">
        <div className="mb-0">
          <Breadcrumb />
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden -mt-5">
          {/* Page header skeleton */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center relative">
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

          {/* Template content skeleton */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template image skeleton */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="relative rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center h-48">
                    <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Template details skeleton */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <dl className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="h-5 w-28 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="h-5 w-36 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template && !loading) {
    return (
      <div className="p-1 max-w-7xl mx-auto bg-gray-100">
        <div className="mb-0">
          <Breadcrumb />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center -mt-5">
          <FileImage size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2 text-gray-800">
            Template Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The template you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => router.push("/qr-templates")}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
          >
            Go Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-0">
        <Breadcrumb />
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden -mt-5">
        {/* Page header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center relative">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="mr-1" size={12} /> Back
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-gray-900">
            Template Details
          </h1>
          <div className="flex-1" />
          <button
            onClick={() => router.push(`/qr-templates/edit/${templateId}`)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white bg-orange-500 hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-700 transition-colors duration-200"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
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

        {/* Template content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template image */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4">
                {" "}
                {/* Reduced padding */}
                {template?.image_name ? (
                  <div className="relative rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center h-48">
                    {" "}
                    {/* Reduced height */}
                    <img
                      src={templateService.getTemplateImageUrl(
                        template.image_name
                      )}
                      alt={template.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const imgUrl = templateService.getTemplateImageUrl(
                          template.image_name
                        );
                        console.error(
                          `Failed to load template image: ${template.image_name}`,
                          {
                            url: imgUrl,
                            template_id: template.qr_code_template_id,
                          }
                        );
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center">
                      <FileImage size={48} className="text-gray-400" />{" "}
                      {/* Reduced icon size */}
                      <span className="text-xs mt-1 text-gray-500">
                        Image not available
                      </span>
                      <div className="mt-2 text-xs text-gray-400">
                        {template.image_name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 border border-gray-200 rounded-md">
                    {" "}
                    {/* Reduced height */}
                    <FileImage size={40} />
                    <span className="text-xs mt-1">No image available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Template details */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4">
                {" "}
                {/* Reduced padding */}
                <dl className="space-y-4">
                  {" "}
                  {/* Reduced spacing */}
                  <div className="grid grid-cols-2 gap-4">
                    {" "}
                    {/* 2 columns layout */}
                    <div>
                      <dt className="text-xs text-gray-500 mb-1">Name</dt>
                      <dd className="text-[12px] font-medium text-gray-900">
                        {template?.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 mb-1">
                        QR Code Position
                      </dt>
                      <dd className="text-[12px] font-medium text-gray-900 capitalize">
                        {template?.qr_overlay_position}
                      </dd>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {" "}
                    {/* 2 columns layout */}
                    <div>
                      <dt className="text-xs text-gray-500 mb-1">
                        Image Filename
                      </dt>
                      <dd className="text-[12px] font-medium text-gray-900 break-all">
                        {template?.image_name || "None"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 mb-1 flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        Created On
                      </dt>
                      <dd className="text-[12px] font-medium text-gray-900">
                        {template?.created_on}
                      </dd>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {" "}
                    {/* Reduced spacing */}
                    <h3 className="text-xs font-medium text-gray-500 mb-2">
                      QR Position Preview
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {" "}
                      {/* Reduced padding */}
                      <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        {" "}
                        {/* Reduced height */}
                        {template?.qr_overlay_position === "centre" ? (
                          <div className="p-2 bg-white border border-gray-300 rounded-md">
                            <QrCode size={60} className="text-gray-800" />{" "}
                            {/* Reduced QR size */}
                          </div>
                        ) : (
                          <div className="absolute top-3 left-0 right-0 flex justify-center">
                            <div className="p-2 bg-white border border-gray-300 rounded-md">
                              <QrCode size={48} className="text-gray-800" />{" "}
                              {/* Reduced QR size */}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              Confirm Deletion
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to delete the template "{template?.name}"?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-[12px] font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md text-[12px] font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
