const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  if (window.supermDesktop?.apiBaseUrl) {
    return window.supermDesktop.apiBaseUrl.replace(/\/$/, '');
  }

  const isElectron = navigator.userAgent.toLowerCase().includes('electron');
  const isFileOrigin = window.location.protocol === 'file:';
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (isElectron || isFileOrigin || isLocalhost) {
    return 'http://localhost:5000';
  }

  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();
