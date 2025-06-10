import { makeApiRequest } from "@/utils/apiUtils";
import { ENDPOINTS } from "@/api/config";
import tokenService from "@/services/tokenService";

/**
 * Outlet Service - Handles all API calls related to outlets
 */
const outletService = {
  /**
   * Get all outlets
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Response data containing list of outlets
   */
  getAllOutlets: (params = {}) => {
    return makeApiRequest({
      endpoint: "/common/listview_outlet",
      method: "POST",
      data: {
        ...params,
        app_source: "admin_dashboard",
      },
    })
      .then((data) => {
        if (data.detail?.includes("Error with token")) {
          throw new Error("Authentication error: " + data.detail);
        }
        return data;
      })
      .catch((error) => {
        console.error("Error fetching outlets:", error);
        throw error;
      });
  },

  /**
   * Get outlet details by ID
   * @param {number} outletId - ID of the outlet
   * @returns {Promise<Object>} - Response data containing outlet details
   */
  getOutletDetails: (outletId) => {
    return makeApiRequest({
      endpoint: "/common/view_outlet",
      method: "POST",
      data: {
        outlet_id: outletId,
        app_source: "admin_dashboard",
      },
    })
      .then((data) => {
        if (data.detail?.includes("Error with token")) {
          throw new Error("Authentication error: " + data.detail);
        }
        return data;
      })
      .catch((error) => {
        console.error("Error fetching outlet details:", error);
        throw error;
      });
  },

  /**
   * Create a new outlet
   * @param {Object} formData - Outlet data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Response data
   */
  createOutlet: async (formData, userId) => {
    try {
      // Get user data from token service if userId not provided
      if (!userId) {
        const userData = tokenService.getUserData();
        userId = userData?.id || localStorage.getItem("userId") || 1;
      }

      console.log("Creating outlet with user ID:", userId);

      // Check if formData is a FormData instance
      if (formData instanceof FormData) {
        // Ensure user_id is included
        formData.append("user_id", userId.toString());
        formData.append("app_source", "admin_dashboard");

        // Log FormData contents
        const formDataObj = {};
        formData.forEach((value, key) => {
          formDataObj[key] = value;
        });
        console.log("FormData contents:", formDataObj);

        // Create a new FormData instance to ensure clean data
        const cleanFormData = new FormData();
        formData.forEach((value, key) => {
          cleanFormData.append(key, value);
        });

        return await makeApiRequest({
          endpoint: "/admin/create_outlet",
          method: "POST",
          data: cleanFormData,
          useFormData: true,
        });
      } else {
        // If it's regular JSON data
        const requestData = {
          ...formData,
          user_id: userId.toString(),
          app_source: "admin_dashboard",
        };
        console.log("Request data being sent:", requestData);

        return await makeApiRequest({
          endpoint: "/admin/create_outlet",
          method: "POST",
          data: requestData,
        });
      }
    } catch (error) {
      console.error("Error creating outlet:", error);
      throw error;
    }
  },

  /**
   * Update an existing outlet
   * @param {Object|FormData} outletData - Outlet data with ID
   * @returns {Promise<Object>} - Response data
   */
  updateOutlet: async (outletData) => {
    try {
      // Check if outletData is a FormData instance
      if (outletData instanceof FormData) {
        // If it's FormData, we need to convert to regular object and send as JSON
        const formObject = {};
        outletData.forEach((value, key) => {
          // Skip image for now
          if (key !== "image") {
            formObject[key] = value;
          }
        });
        formObject.app_source = "admin_dashboard";

        return await makeApiRequest({
          endpoint: "/common/update_outlet",
          method: "PATCH",
          data: formObject,
        });
      } else {
        // If it's regular JSON data
        return await makeApiRequest({
          endpoint: "/common/update_outlet",
          method: "PATCH",
          data: {
            ...outletData,
            app_source: "admin_dashboard",
          },
        });
      }
    } catch (error) {
      console.error("Error updating outlet:", error);
      throw error;
    }
  },

  /**
   * Delete an outlet
   * @param {number} outletId - ID of outlet to delete
   * @returns {Promise<Object>} - Response data
   */
  deleteOutlet: (outletId, userId) => {
    return makeApiRequest({
      endpoint: "/admin/delete_outlet",
      method: "DELETE",
      data: {
        outlet_id: outletId,
        user_id: userId,
        app_source: "admin_dashboard",
      },
    })
      .then((data) => {
        if (data.detail?.includes("Error with token")) {
          throw new Error("Authentication error: " + data.detail);
        }
        return data;
      })
      .catch((error) => {
        console.error("Error deleting outlet:", error);
        throw error;
      });
  },

  // List all outlets
  listOutlets: async (userId) => {
    try {
      const data = await makeApiRequest({
        endpoint: "/common/listview_outlet",
        method: "POST",
        data: {
          user_id: parseInt(userId),
          app_source: "admin_dashboard",
        },
      });

      if (data.detail?.includes("Error with token")) {
        throw new Error("Authentication error: " + data.detail);
      }

      // Return the data array if it exists, otherwise return the raw response
      return data.data || data;
    } catch (error) {
      console.error("Error fetching outlets:", error);
      throw error;
    }
  },

  // View outlet details
  viewOutlet: async (outletId, userId) => {
    try {
      const userData = tokenService.getUserData();
      const userIdToUse = userId || userData?.user_id || 2;

      const data = await makeApiRequest({
        endpoint: "/common/view_outlet",
        method: "POST",
        data: {
          outlet_id: parseInt(outletId),
          user_id: parseInt(userIdToUse),
          app_source: "admin_dashboard",
        },
      });

      if (data.detail?.includes("Error with token")) {
        throw new Error("Authentication error: " + data.detail);
      }

      // Return the data object if it exists, otherwise return the raw response
      return data.data || data;
    } catch (error) {
      console.error("Error fetching outlet details:", error);
      throw error;
    }
  },
};

export default outletService;
