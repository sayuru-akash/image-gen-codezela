/**
 * Utility functions for safe localStorage operations with quota management
 */

/**
 * Safely set an item in localStorage with quota handling
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store (will be JSON.stringified)
 * @param {Function} onQuotaExceeded - Callback function when quota is exceeded
 * @returns {boolean} - Success status
 */
export const safeSetItem = (key, value, onQuotaExceeded = null) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);

    if (error.name === "QuotaExceededError") {
      console.log("LocalStorage quota exceeded");
      if (onQuotaExceeded && typeof onQuotaExceeded === "function") {
        onQuotaExceeded(error);
      }
    }
    return false;
  }
};

/**
 * Safely get an item from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {any} - The parsed value or default value
 */
export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Failed to get from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Safely remove an item from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} - Success status
 */
export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Get the approximate size of a localStorage item
 * @param {string} key - The localStorage key
 * @returns {object} - Object with size in bytes and MB
 */
export const getItemSize = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return { bytes: 0, mb: 0 };

    const bytes = new Blob([item]).size;
    const mb = bytes / (1024 * 1024);

    return { bytes, mb };
  } catch (error) {
    console.error(`Failed to get size for localStorage item (${key}):`, error);
    return { bytes: 0, mb: 0 };
  }
};

/**
 * Get total localStorage usage
 * @returns {object} - Object with total size and available space estimate
 */
export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        totalSize += new Blob([item]).size;
      }
    }

    const totalMB = totalSize / (1024 * 1024);
    const estimatedLimit = 10; // Most browsers have ~5-10MB limit
    const usagePercent = (totalMB / estimatedLimit) * 100;

    return {
      totalBytes: totalSize,
      totalMB: totalMB,
      usagePercent: Math.min(usagePercent, 100),
      estimatedLimit: estimatedLimit,
    };
  } catch (error) {
    console.error("Failed to calculate localStorage usage:", error);
    return {
      totalBytes: 0,
      totalMB: 0,
      usagePercent: 0,
      estimatedLimit: 10,
    };
  }
};

/**
 * Clear localStorage items that match a pattern
 * @param {RegExp|string} pattern - Pattern to match keys against
 * @returns {number} - Number of items removed
 */
export const clearItemsByPattern = (pattern) => {
  try {
    const keysToRemove = [];
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && regex.test(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return keysToRemove.length;
  } catch (error) {
    console.error("Failed to clear localStorage items by pattern:", error);
    return 0;
  }
};

/**
 * Estimate the size of data before storing
 * @param {any} data - Data to estimate size for
 * @returns {object} - Object with estimated size in bytes and MB
 */
export const estimateDataSize = (data) => {
  try {
    const serialized = JSON.stringify(data);
    const bytes = new Blob([serialized]).size;
    const mb = bytes / (1024 * 1024);

    return { bytes, mb };
  } catch (error) {
    console.error("Failed to estimate data size:", error);
    return { bytes: 0, mb: 0 };
  }
};
