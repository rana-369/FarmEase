import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api/axios';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (endpoint, params) => {
  return `${endpoint}:${JSON.stringify(params || {})}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setToCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Clear cache for specific endpoint or all
export const clearApiCache = (endpoint = null) => {
  if (endpoint) {
    for (const key of cache.keys()) {
      if (key.startsWith(endpoint)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// ============================================
// useApi - Generic API hook with caching & retry
// ============================================
export const useApi = (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    params = null,
    enabled = true,
    cacheEnabled = true,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryAttempt = useRef(0);
  const mounted = useRef(true);

  const execute = useCallback(async (overrideBody = null, overrideParams = null) => {
    if (!enabled) return;

    const cacheKey = getCacheKey(endpoint, overrideParams || params);
    
    // Check cache for GET requests
    if (method === 'GET' && cacheEnabled) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      const config = { params: overrideParams || params };
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await API.get(endpoint, config);
          break;
        case 'POST':
          response = await API.post(endpoint, overrideBody || body, config);
          break;
        case 'PUT':
          response = await API.put(endpoint, overrideBody || body, config);
          break;
        case 'PATCH':
          response = await API.patch(endpoint, overrideBody || body, config);
          break;
        case 'DELETE':
          response = await API.delete(endpoint, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (mounted.current) {
        const result = response.data;
        setData(result);
        
        // Cache GET responses
        if (method === 'GET' && cacheEnabled) {
          setToCache(cacheKey, result);
        }
        
        retryAttempt.current = 0;
        onSuccess?.(result);
      }
      
      return response.data;
    } catch (err) {
      // Retry logic for network errors
      const shouldRetry = retryAttempt.current < retryCount && 
        (err.code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED' || err.response?.status >= 500);
      
      if (shouldRetry) {
        retryAttempt.current++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryAttempt.current));
        return execute(overrideBody, overrideParams);
      }
      
      if (mounted.current) {
        const errorData = err.response?.data || { message: err.message || 'An error occurred' };
        setError(errorData);
        onError?.(errorData);
      }
      
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [endpoint, method, body, params, enabled, cacheEnabled, retryCount, retryDelay, onSuccess, onError]);

  const refetch = useCallback(() => {
    // Clear cache for this endpoint before refetching
    if (cacheEnabled) {
      const cacheKey = getCacheKey(endpoint, params);
      cache.delete(cacheKey);
    }
    return execute();
  }, [execute, cacheEnabled, endpoint, params]);

  useEffect(() => {
    mounted.current = true;
    
    if (enabled && method === 'GET') {
      execute();
    }
    
    return () => {
      mounted.current = false;
    };
  }, [enabled, method, execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    isFetching: loading && data !== null,
    isLoading: loading && data === null,
  };
};

// ============================================
// useLazyApi - For manual API calls (not auto-executed)
// ============================================
export const useLazyApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const execute = useCallback(async (body = null, params = null) => {
    setLoading(true);
    setError(null);

    try {
      const config = { params };
      const response = await API.post(endpoint, body, config);
      
      if (mounted.current) {
        setData(response.data);
      }
      
      return response.data;
    } catch (err) {
      if (mounted.current) {
        const errorData = err.response?.data || { message: err.message || 'An error occurred' };
        setError(errorData);
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [endpoint]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return [execute, { data, loading, error }];
};

// ============================================
// useMutation - For POST/PUT/DELETE operations
// ============================================
export const useMutation = (endpoint, method = 'POST', options = {}) => {
  const { onSuccess, onError } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const mutate = useCallback(async (body = null, params = null) => {
    setLoading(true);
    setError(null);

    try {
      const config = { params };
      let response;

      switch (method.toUpperCase()) {
        case 'POST':
          response = await API.post(endpoint, body, config);
          break;
        case 'PUT':
          response = await API.put(endpoint, body, config);
          break;
        case 'PATCH':
          response = await API.patch(endpoint, body, config);
          break;
        case 'DELETE':
          response = await API.delete(endpoint, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (mounted.current) {
        setData(response.data);
        onSuccess?.(response.data);
      }
      
      return response.data;
    } catch (err) {
      if (mounted.current) {
        const errorData = err.response?.data || { message: err.message || 'An error occurred' };
        setError(errorData);
        onError?.(errorData);
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [endpoint, method, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return { mutate, reset, data, loading, error };
};

// ============================================
// usePaginatedApi - For paginated data
// ============================================
export const usePaginatedApi = (endpoint, options = {}) => {
  const {
    pageSize = 10,
    params = {},
    cacheEnabled = true,
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum = page, append = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await API.get(endpoint, {
        params: {
          ...params,
          page: pageNum,
          pageSize,
        },
      });

      const { items, totalPages: tp, totalItems: ti } = response.data;

      if (append) {
        setData(prev => [...prev, ...items]);
      } else {
        setData(items);
      }

      setTotalPages(tp);
      setTotalItems(ti);
      setHasMore(pageNum < tp);
      setPage(pageNum);
    } catch (err) {
      const errorData = err.response?.data || { message: err.message || 'An error occurred' };
      setError(errorData);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, params, loading]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchData(page + 1, true);
    }
  }, [hasMore, loading, page, fetchData]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchData(1, false);
  }, [fetchData]);

  useEffect(() => {
    fetchData(1, false);
  }, [endpoint]); // Only refetch when endpoint changes

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    hasMore,
    loadMore,
    refresh,
    isFetchingMore: loading && data.length > 0,
  };
};

export default useApi;
