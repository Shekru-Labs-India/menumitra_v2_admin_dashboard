/**
 * Token management service for handling authentication tokens
 */
import {
  getCachedUserData,
  isCachedAuthenticated,
  invalidateAuthCache,
} from "@/utils/optimizedAuth";

const TOKEN_KEYS = {
  AUTH_TOKEN: "authToken",
  TOKEN_TYPE: "tokenType",
  USER_ID: "userId",
  USER_NAME: "userName",
  USER_EMAIL: "userEmail",
  USER_ROLE: "userRole",
  USER_MOBILE: "userMobile",
  TOKEN_EXPIRY: "tokenExpiry",
};

// Cache for auth header to avoid repeated construction
let authHeaderCache = null;

const tokenService = {
  /**
   * Store authentication data in localStorage
   * @param {Object} authData - Authentication data from server
   */
  setAuthData: (authData) => {
    if (!authData) return;

    const {
      access_token,
      token_type,
      user_id,
      name,
      email,
      role,
      mobile,
      expires_at,
    } = authData;

    try {
      // Clear any existing cache first
      invalidateAuthCache();
      authHeaderCache = null;

      // Store all token data at once
      localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, access_token);
      localStorage.setItem(TOKEN_KEYS.TOKEN_TYPE, token_type);
      localStorage.setItem(TOKEN_KEYS.USER_ID, user_id);
      localStorage.setItem(TOKEN_KEYS.USER_NAME, name);
      localStorage.setItem(TOKEN_KEYS.USER_EMAIL, email);
      localStorage.setItem(TOKEN_KEYS.USER_ROLE, role);
      localStorage.setItem(TOKEN_KEYS.USER_MOBILE, mobile);
      localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expires_at);

      console.log("Auth data set successfully");
    } catch (error) {
      console.error("Error storing auth data:", error);
    }
  },

  /**
   * Get the full authorization header value with caching
   * @returns {string|null} Authorization header value
   */
  getAuthHeader: () => {
    // Return cached value if available
    if (authHeaderCache) {
      return authHeaderCache;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
      const tokenType = localStorage.getItem(TOKEN_KEYS.TOKEN_TYPE);

      if (!token || !tokenType) return null;

      // Cache the auth header
      authHeaderCache = `${tokenType} ${token}`;
      return authHeaderCache;
    } catch (error) {
      console.error("Error getting auth header:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return isCachedAuthenticated();
  },

  /**
   * Get user data
   * @returns {Object} User data
   */
  getUserData: () => {
    try {
      const userData = getCachedUserData();
      console.log("Token service getUserData:", {
        cachedData: userData,
        localStorage: {
          userId: localStorage.getItem("userId"),
          userName: localStorage.getItem("userName"),
          userEmail: localStorage.getItem("userEmail"),
          userRole: localStorage.getItem("userRole"),
          userMobile: localStorage.getItem("userMobile"),
        },
      });
      return userData;
    } catch (error) {
      console.error("Error in getUserData:", error);
      return null;
    }
  },

  /**
   * Clear all auth data from localStorage
   */
  clearAuthData: () => {
    try {
      // Clear cache first
      invalidateAuthCache();
      authHeaderCache = null;

      // Clear localStorage items
      Object.values(TOKEN_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      localStorage.removeItem("mobileNumber"); // Also clear mobile used for OTP
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  },
};

export default tokenService;
