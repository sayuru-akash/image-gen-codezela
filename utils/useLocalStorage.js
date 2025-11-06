import { useState, useEffect, useCallback } from "react";
import {
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
  getItemSize,
} from "../utils/storageUtils";

/**
 * Custom hook for managing localStorage with quota handling
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @param {object} options - Configuration options
 * @returns {array} - [value, setValue, removeValue, isLoading, error, storageInfo]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    maxSizeMB = 5, // Maximum size in MB before warning
    onQuotaExceeded = null, // Callback when quota is exceeded
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial value from localStorage
  useEffect(() => {
    try {
      setIsLoading(true);
      const item = safeGetItem(key, initialValue);
      setStoredValue(item);
      setError(null);
    } catch (err) {
      setError(err);
      setStoredValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  // Get storage info for current item
  const getStorageInfo = useCallback(() => {
    return getItemSize(key);
  }, [key]);

  // Set value with quota handling
  const setValue = useCallback(
    (value) => {
      try {
        setError(null);

        // Estimate size before setting
        const estimatedSize = new Blob([serialize(value)]).size / (1024 * 1024);

        if (estimatedSize > maxSizeMB) {
          const error = new Error(
            `Data size (${estimatedSize.toFixed(
              2
            )}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
          );
          setError(error);
          return false;
        }

        const success = safeSetItem(key, value, (quotaError) => {
          setError(quotaError);
          if (onQuotaExceeded) {
            onQuotaExceeded(quotaError, value);
          }
        });

        if (success) {
          setStoredValue(value);
        }

        return success;
      } catch (err) {
        setError(err);
        return false;
      }
    },
    [key, maxSizeMB, onQuotaExceeded, serialize]
  );

  // Remove value
  const removeValue = useCallback(() => {
    try {
      setError(null);
      const success = safeRemoveItem(key);
      if (success) {
        setStoredValue(initialValue);
      }
      return success;
    } catch (err) {
      setError(err);
      return false;
    }
  }, [key, initialValue]);

  // Update stored value when key changes
  useEffect(() => {
    const item = safeGetItem(key, initialValue);
    setStoredValue(item);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, isLoading, error, getStorageInfo];
};

/**
 * Hook for managing array data in localStorage with automatic cleanup
 * @param {string} key - The localStorage key
 * @param {array} initialValue - Initial array value
 * @param {object} options - Configuration options
 * @returns {object} - Object with array operations and metadata
 */
export const useLocalStorageArray = (key, initialValue = [], options = {}) => {
  const {
    maxItems = 10,
    maxSizeMB = 5,
    autoCleanup = true,
    onQuotaExceeded = null,
  } = options;

  const [array, setArray, removeArray, isLoading, error, getStorageInfo] =
    useLocalStorage(key, initialValue, {
      maxSizeMB,
      onQuotaExceeded: (quotaError, value) => {
        if (autoCleanup && Array.isArray(value)) {
          // Try to save with reduced array size
          const reducedArray = value.slice(
            0,
            Math.max(1, Math.floor(maxItems / 2))
          );
          const success = safeSetItem(key, reducedArray);
          if (success) {
            setArray(reducedArray);
          }
        }
        if (onQuotaExceeded) {
          onQuotaExceeded(quotaError, value);
        }
      },
    });

  // Add item to array
  const addItem = useCallback(
    (item) => {
      setArray((currentArray) => {
        const newArray = [item, ...(currentArray || []).slice(0, maxItems - 1)];
        return newArray;
      });
    },
    [setArray, maxItems]
  );

  // Remove item by index
  const removeItem = useCallback(
    (index) => {
      setArray((currentArray) => {
        if (!currentArray || !Array.isArray(currentArray)) return currentArray;
        return currentArray.filter((_, i) => i !== index);
      });
    },
    [setArray]
  );

  // Remove item by condition
  const removeItemWhere = useCallback(
    (predicate) => {
      setArray((currentArray) => {
        if (!currentArray || !Array.isArray(currentArray)) return currentArray;
        return currentArray.filter((item, index) => !predicate(item, index));
      });
    },
    [setArray]
  );

  // Clear all items
  const clearItems = useCallback(() => {
    setArray([]);
  }, [setArray]);

  // Get array metadata
  const getArrayInfo = useCallback(() => {
    const storageInfo = getStorageInfo();
    return {
      ...storageInfo,
      itemCount: Array.isArray(array) ? array.length : 0,
      maxItems,
      isFull: Array.isArray(array) && array.length >= maxItems,
    };
  }, [getStorageInfo, array, maxItems]);

  return {
    items: array || [],
    addItem,
    removeItem,
    removeItemWhere,
    clearItems,
    setItems: setArray,
    removeAll: removeArray,
    isLoading,
    error,
    getArrayInfo,
  };
};
