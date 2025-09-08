// Temporary fix for mixed content - Option 3: Quick Fix
// This should be replaced with proper HTTPS setup in production

// API configuration - using same endpoint for both environments
// CSP header will automatically upgrade HTTP to HTTPS in production
const API_BASE_URL = "http://4.194.251.51:8000";

// Utility function for API calls with mixed content handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      // Add headers to handle mixed content
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("API call failed:", error);

    // If mixed content error in production, provide helpful message
    if (
      error.message.includes("Mixed Content") ||
      error.message.includes("ERR_INSECURE_RESPONSE")
    ) {
      console.warn(
        "Mixed content error detected. Ensure your backend supports HTTPS in production."
      );
    }

    throw error;
  }
};

// Helper function to get the API base URL
export const getApiBaseUrl = () => API_BASE_URL;

// Export for direct use in components
export { API_BASE_URL };
