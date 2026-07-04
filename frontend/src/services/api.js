const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Custom Fetch API Wrapper simulating an Axios client with timeout and interceptor hooks.
 */
const customFetch = async (url, options = {}) => {
  const { timeout = 10000, ...customOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Request Interceptor: Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(customOptions.headers || {})
  };

  const config = {
    ...customOptions,
    headers,
    signal: controller.signal
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    clearTimeout(timeoutId);

    // Response Interceptor: Handle status errors
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error || `HTTP error! Status: ${response.status}`;
      return { data: null, error: errMsg, status: response.status };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);

    // Differentiate timeout vs. actual connection failure
    if (error.name === 'AbortError') {
      return { data: null, error: 'Request timeout. Server took too long to respond.', status: 408 };
    }
    return { data: null, error: 'Network error. Please check if the CRM backend is active.', status: 500 };
  }
};

export const api = {
  get: (url, options) => customFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options) => customFetch(url, { ...options, method: 'POST', body }),
  put: (url, body, options) => customFetch(url, { ...options, method: 'PUT', body }),
  delete: (url, options) => customFetch(url, { ...options, method: 'DELETE' })
};
export default api;
