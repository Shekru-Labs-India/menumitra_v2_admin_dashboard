import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdmin } from "../../../hooks/useAdmin";
import { useAuth } from "../../../hooks/useAuth";
import { TextInput } from "../../forms/FormElements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../Breadcrumb";
import { toastController } from "../../../utils/toastController";

function CreateCategory() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Add state for name error
  const [nameError, setNameError] = useState("");

  // Ref for form submission from Save button
  const formRef = React.useRef();

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://menu4.xyz/v2/common/menu_category_create",
        {
          outlet_id: outletId,
          category_name: categoryName,
          user_id: adminData?.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      toastController.success(response.data.detail || "Success");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      toastController.error(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", path: "/home" },
          { label: "Outlets", path: "/outlets" },
          { label: "Categories", path: `/categories/${outletId}` },
          { label: "Create Category" },
        ]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
              type="button"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Create Category
            </h2>

            {/* Save Button */}
            <button
              onClick={() => formRef.current?.requestSubmit()}
              disabled={loading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              type="button"
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="sm:col-span-1">
              <TextInput
                label="Category Name"
                required
                value={categoryName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!/^[A-Za-z\s]*$/.test(value)) {
                    setNameError(
                      "Category name should only contain alphabets and spaces"
                    );
                  } else {
                    setNameError("");
                  }
                  setCategoryName(value);
                }}
                placeholder="Enter category name"
              />
              {nameError && (
                <p className="text-error-500 text-sm mt-1">{nameError}</p>
              )}
            </div>

            {/* Submit button hidden */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
              style={{ display: "none" }}
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCategory;
