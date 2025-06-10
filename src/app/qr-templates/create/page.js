"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { templateService } from "@/api";
import Breadcrumb from "@/components/Breadcrumb"; // <-- Added import

export default function CreateTemplate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("centre");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !position || !imageFile) {
      setError("Please fill in all fields and upload an image.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const templateData = {
        name,
        qr_overlay_position: position,
        image: imageFile,
      };

      console.log("Submitting template creation data:", {
        name: templateData.name,
        qr_overlay_position: templateData.qr_overlay_position,
        image_filename: templateData.image.name,
        image_size: templateData.image.size,
      });

      const result = await templateService.createTemplate(templateData);
      console.log("Template creation response:", result);

      // Check if there was an error in the API response
      if (result && result.error) {
        console.error("API returned an error:", result.error);
        setError(`Failed to create template: ${result.error}`);
        setLoading(false);
        return;
      }

      // Navigate back to templates list on success
      router.push("/qr-templates");
    } catch (err) {
      console.error("Failed to create template:", err);
      setError("Failed to create template. Please try again.");
    } finally {
      setLoading(false);
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

  // Clear the selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="p-1 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-0">
        <Breadcrumb />
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 -mt-5">
        <div className="p-2 flex items-center relative mb-3">
          <button
            type="button"
            onClick={() => router.push("/qr-templates")}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-2xl shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="mr-1" size={12} />
            Back
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-gray-900">
            Create Template
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form fields */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Classic, Modern, Elegant"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs text-gray-900 focus:ring-gray-700 focus:border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  QR Code Position <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Center Position */}
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
                          size={20}
                          className={
                            position === "centre"
                              ? "text-gray-800"
                              : "text-gray-400"
                          }
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          position === "centre"
                            ? "text-gray-800"
                            : "text-gray-700"
                        }`}
                      >
                        Center
                      </span>
                    </div>
                  </label>

                  {/* Top Position */}
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
                            size={20}
                            className={
                              position === "top"
                                ? "text-gray-800"
                                : "text-gray-400"
                            }
                          />
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          position === "top" ? "text-gray-800" : "text-gray-700"
                        }`}
                      >
                        Top
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Template Image <span className="text-red-500">*</span>
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
                    <X size={16} className="text-gray-700" />
                  </button>
                  <div className="p-3 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                    <span>{imageFile.name}</span>
                    <span>{(imageFile.size / 1024).toFixed(1)} KB</span>
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
                      size={40}
                      className={dragActive ? "text-gray-800" : "text-gray-400"}
                    />
                    <p className="text-xs text-gray-700 font-medium mb-1">
                      Drag and drop your image here
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={() => router.push("/qr-templates")}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !imageFile}
              className={`flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-[12px] font-medium text-white ${
                loading || !imageFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              } transition-colors duration-200`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Create Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
