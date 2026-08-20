const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return isLocalhost ? 'http://localhost:5000' : window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();
