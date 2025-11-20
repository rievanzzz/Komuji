// API Configuration
// Automatically detects environment and uses appropriate API URL

// Type-safe access to environment variables
declare const process: {
  env: {
    REACT_APP_API_URL?: string;
    NODE_ENV?: string;
  };
};

const getApiUrl = (): string => {
  // Check if we have a custom API URL from environment
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Auto-detect based on environment
  const isProduction = typeof process !== 'undefined'
    ? process.env?.NODE_ENV === 'production'
    : window.location.hostname !== 'localhost';

  if (isProduction) {
    // Production: use same origin + /api
    return window.location.origin + '/api';
  }

  // Development: use Laravel dev server
  return 'http://localhost:8000/api';
};

const API_URL = getApiUrl();

export const config = {
  apiUrl: API_URL,
  baseUrl: API_URL.replace('/api', ''),
};

export default config;
