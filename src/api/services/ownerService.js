import { makeApiRequest } from "@/utils/apiUtils";

const ownerService = {
  // Create a new owner
  createOwner: async (data) => {
    try {
      // Ensure user_id is included in the request
      const requestData = {
        ...data,
        user_id: parseInt(localStorage.getItem("userId") || "0"),
      };

      return await makeApiRequest({
        endpoint: `/admin/create_owner`,
        method: "POST",
        data: requestData,
      });
    } catch (error) {
      console.error("Error creating owner:", error);
      throw error;
    }
  },

  // Get list of owners
  listOwners: async () => {
    try {
      const userId = parseInt(localStorage.getItem("userId") || "0");
      return await makeApiRequest({
        endpoint: `/admin/listview_owner/${userId}`,
        method: "GET",
      });
    } catch (error) {
      console.error("Error fetching owners:", error);
      throw error;
    }
  },

  // View owner details
  viewOwner: async (ownerId) => {
    try {
      const userId = parseInt(localStorage.getItem("userId") || "0");
      return await makeApiRequest({
        endpoint: `/admin/view_owner`,
        method: "POST",
        data: {
          user_id: userId,
          owner_id: parseInt(ownerId),
        },
      });
    } catch (error) {
      console.error("Error viewing owner:", error);
      throw error;
    }
  },

  // Update owner
  updateOwner: async (data) => {
    try {
      // Do not override the user_id from the data parameter
      // as it should be the owner's user_id, not the admin's
      return await makeApiRequest({
        endpoint: `/admin/update_owner`,
        method: "PATCH",
        data: data,  // Use the data as provided
      });
    } catch (error) {
      console.error("Error updating owner:", error);
      throw error;
    }
  },

  // Delete owner
  deleteOwner: async (ownerId) => {
    try {
      const userId = parseInt(localStorage.getItem("userId") || "0");
      return await makeApiRequest({
        endpoint: `/admin/delete_owner`,
        method: "DELETE",
        data: {
          owner_id: parseInt(ownerId),
          user_id: userId,
        },
      });
    } catch (error) {
      console.error("Error deleting owner:", error);
      throw error;
    }
  },
};

export default ownerService;
