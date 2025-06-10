/**
 * API utility functions
 */

import { API_URL } from "@/api/config";
import { isStaticExport } from "@/utils/staticConfig";

// Flag to check if we're on client side
const isClient = typeof window !== "undefined";

// Flag to check if we're running in local development
const isLocalDev =
  isClient &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Flag to check if we're in production mode
const isProduction = process.env.NODE_ENV === "production";

// Simplified logging function
const logDebug = (message, data) => {
  if (isClient && process.env.NODE_ENV !== "production") {
    console.log(message, data);
  }
};

/**
 * Get the authentication token from localStorage
 * @returns {string|null} - Authentication token or null if not available
 */
export const getAuthToken = () => {
  if (!isClient) {
    return null;
  }

  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("tokenType") || "bearer";

  if (!token) {
    return null;
  }

  // Return raw token without type
  return token;
};

/**
 * Get the authentication header for API requests
 * @param {string} contentType - Optional content type to use (default: application/json)
 * @returns {Object} - Headers object with Authorization if available
 */
export const getAuthHeaders = () => {
  if (!isClient) {
    return { "Content-Type": "application/json" };
  }

  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("tokenType") || "bearer";

  if (!token) {
    console.warn("No authentication token found");
    return { "Content-Type": "application/json" };
  }

  // Ensure token is properly formatted
  const formattedToken = token.trim();

  return {
    "Content-Type": "application/json",
    Authorization: `${tokenType} ${formattedToken}`,
  };
};

/**
 * Safely get auth header
 * @returns {string|null} Authorization header or null
 */
export const getAuthHeader = () => {
  if (!isClient) {
    return null;
  }

  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("tokenType") || "bearer";

  if (!token) {
    return null;
  }

  return `${tokenType} ${token}`;
};

/**
 * Add authentication to fetch options
 * @param {Object} options - Fetch options object
 * @returns {Object} - Fetch options with authentication headers added
 */
export const addAuthToOptions = (options = {}) => {
  const token = getAuthToken();

  if (!token) {
    return options;
  }

  // Create headers if they don't exist
  if (!options.headers) {
    options.headers = {};
  }

  // Add authorization header
  options.headers["Authorization"] = token;

  return options;
};

/**
 * Make an API request that works in both static and SSR environments
 * @param {Object} options - Request options
 * @param {string} options.endpoint - API endpoint (e.g., "/admin/login")
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request body data
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.useFormData - Whether to use FormData
 * @returns {Promise<Object>} Response data
 */
export const makeApiRequest = async ({
  endpoint,
  method = "GET",
  data = null,
  headers = {},
  useFormData = false,
}) => {
  try {
    // Log API call
    logDebug(`API Request: ${method} ${endpoint}`, data);

    // Get auth headers and merge with provided headers
    const authHeaders = getAuthHeaders();
    const requestHeaders = { ...authHeaders, ...headers };

    // Prepare the request options
    const requestOptions = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (method !== "GET" && data) {
      if (useFormData) {
        // For FormData, remove Content-Type to let the browser set it
        delete requestOptions.headers["Content-Type"];
        requestOptions.body = data;

        // Debug log FormData contents
        console.log("FormData being sent:", {
          user_id: data.get("user_id"),
          app_source: data.get("app_source"),
        });
      } else {
        requestOptions.body = JSON.stringify(data);
        // Debug log JSON data
        console.log("JSON data being sent:", data);
      }
    }

    let response;

    // For local development and not in production, use the proxy server
    if (isLocalDev && !isProduction && !isStaticExport) {
      // Proxy API request via /api/proxy endpoint
      logDebug(`Using local proxy for API request: ${endpoint}`);

      // Convert FormData to object if needed
      let requestData = data;
      if (data instanceof FormData) {
        requestData = {};
        data.forEach((value, key) => {
          requestData[key] = value;
        });
      }

      const proxyOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint,
          method,
          data: requestData,
          headers: authHeaders,
          useFormData: useFormData,
        }),
      };

      // Debug log proxy request
      console.log("Proxy request options:", {
        endpoint,
        method,
        data: requestData,
        headers: authHeaders,
        useFormData,
      });

      response = await fetch("/api/proxy", proxyOptions);
    } else {
      // Direct API call
      // Build the URL
      const directUrl = `${API_URL}${endpoint}`;
      logDebug(`Direct API call to: ${directUrl}`);

      // For GET requests with query params
      if (method === "GET" && data && Object.keys(data).length > 0) {
        const queryParams = new URLSearchParams(data).toString();
        const urlWithParams = `${directUrl}?${queryParams}`;

        response = await fetch(urlWithParams, requestOptions);
      } else {
        response = await fetch(directUrl, requestOptions);
      }
    }

    // Parse the response
    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Error processing API response");
    }

    // Log API response
    logDebug(`API Response for ${endpoint}:`, result);

    if (!response.ok) {
      console.error("API error response:", result);
      throw new Error(result.message || result.detail || "API request failed");
    }

    return result;
  } catch (error) {
    // Special handling for network errors
    if (error.message === "Failed to fetch") {
      if (isLocalDev) {
        console.error(`
          PROXY ERROR: Unable to connect to the local proxy server
          
          Please ensure:
          1. You've installed the required dependencies: npm install express cors http-proxy-middleware --save
          2. The proxy server is running: npm run proxy
          3. The proxy server is accessible at http://localhost:3001
          
          See PROXY_SETUP.md for more details on setting up the proxy.
        `);
      } else {
        console.error(`
          NETWORK ERROR: Unable to connect to the API server at ${API_URL}
          
          This could be due to:
          1. Your network connection
          2. The API server is down or not accessible
          3. CORS restrictions (if not using the proxy)
        `);
      }
    }

    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};
