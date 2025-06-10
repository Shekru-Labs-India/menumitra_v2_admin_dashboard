
/**
 * Template service for handling QR template-related API calls
 */
import { ENDPOINTS, API_URL } from '../config';
import { makeApiRequest, getAuthToken } from '@/utils/apiUtils';

const templateService = {
  /**
   * Get all QR templates
   * @returns {Promise<Array>} - Array of QR templates
   */
  getTemplates: async () => {
    try {
      return await makeApiRequest({
        endpoint: `/admin${ENDPOINTS.ADMIN.GET_QR_TEMPLATES}`,
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching QR templates:', error);
      throw error;
    }
  },

  /**
   * Create a new QR template
   * @param {Object} data - Template data
   * @param {string} data.name - Template name
   * @param {string} data.qr_overlay_position - Position of QR overlay
   * @param {File} data.image - Template image file
   * @returns {Promise<Object>} - Created template data
   */
  createTemplate: async (data) => {
    try {
      console.log("Creating template with data:", {
        name: data.name,
        qr_overlay_position: data.qr_overlay_position,
        image_filename: data.image?.name
      });
      
      // Create FormData to send file
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('qr_overlay_position', data.qr_overlay_position);
      formData.append('image', data.image);
      
      return await makeApiRequest({
        endpoint: `/admin${ENDPOINTS.ADMIN.CREATE_QR_TEMPLATE}`,
        method: 'POST',
        data: formData,
        useFormData: true
      });
    } catch (error) {
      console.error('Error creating QR template:', error);
      throw error;
    }
  },

  /**
   * View a specific QR template
   * @param {number} templateId - ID of the template to view
   * @returns {Promise<Object>} - Template details
   */
  viewTemplate: async (templateId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin${ENDPOINTS.ADMIN.VIEW_QR_TEMPLATE}`,
        method: 'POST',
        data: { template_id: templateId }
      });
    } catch (error) {
      console.error('Error viewing QR template:', error);
      throw error;
    }
  },

  /**
   * Update a QR template
   * @param {Object} data - Template data to update
   * @param {string} data.name - Template name
   * @param {string} data.qr_overlay_position - Position of QR overlay
   * @param {number} data.template_id - ID of the template to update
   * @param {File} [data.image] - New template image file (optional)
   * @returns {Promise<Object>} - Updated template data
   */
  updateTemplate: async (data) => {
    try {
      console.log("Updating template with data:", data);
      const templateId = parseInt(data.template_id, 10);
      
      // Create FormData to send file
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('qr_overlay_position', data.qr_overlay_position);
      formData.append('template_id', templateId);
      
      // Add image if provided
      if (data.image) {
        console.log("Image file included in update:", data.image.name);
        formData.append('image', data.image);
      }
      
      return await makeApiRequest({
        endpoint: `/admin${ENDPOINTS.ADMIN.UPDATE_QR_TEMPLATE}`,
        method: 'PATCH',
        data: formData,
        useFormData: true
      });
    } catch (error) {
      console.error('Error updating QR template:', error);
      throw error;
    }
  },

  /**
   * Delete a QR template
   * @param {number} templateId - ID of the template to delete
   * @returns {Promise<Object>} - Response indicating success
   */
  deleteTemplate: async (templateId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin${ENDPOINTS.ADMIN.DELETE_QR_TEMPLATE}/${templateId}`,
        method: 'DELETE',
        data: {}
      });
    } catch (error) {
      console.error('Error deleting QR template:', error);
      throw error;
    }
  },

  /**
   * Get the complete URL for a template image
   * @param {string} imageName - The filename of the image
   * @returns {string} - Complete image URL
   */
  getTemplateImageUrl: (imageName) => {
    if (!imageName) return null;
    
    // Check if an absolute URL was already provided
    if (imageName.startsWith('http')) {
      return imageName;
    }
    
    // Use the most likely URL path based on API analysis
    return `https://men4u.xyz/v2/uploads/qr_code_templates/${imageName}`;
  },
};

export default templateService; 
