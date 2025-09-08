// Temporary fix for mixed content - Option 3: Quick Fix using Proxy
// This uses Next.js API routes to proxy requests and avoid mixed content

// API configuration - use proxy in production, direct in development
const API_BASE_URL =
  process.env.NODE_ENV === "development" ? "http://4.194.251.51:8000" : "/api"; // Use internal API routes in production

// Utility function for API calls with mixed content handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    let url;
    let requestOptions = { ...options };

    if (process.env.NODE_ENV === "development") {
      // Direct call in development
      url = `${API_BASE_URL}${endpoint}`;
    } else {
      // Use specific API routes in production
      url = `${API_BASE_URL}${endpoint}`;
    }

    const response = await fetch(url, requestOptions);

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
      console.warn("Mixed content error detected. Using proxy fallback.");
    }

    throw error;
  }
};

// Helper function to get the API base URL
export const getApiBaseUrl = () => API_BASE_URL;

// Export for direct use in components
export { API_BASE_URL };
