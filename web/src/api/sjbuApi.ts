// web/src/api/sjbuApi.ts

import axios from 'axios';

// Get base URL from environment variable
// const baseURL = process.env.REACT_APP_API_URL;
const baseURL = 'http://localhost:3005/api/app'; 


// Create an Axios instance
const sjbuApi = axios.create({
  baseURL: baseURL,
  // CRITICAL FIX: Increase timeout to 30 seconds (30000ms) for stability under slow database connection
  timeout: 70000, 
  withCredentials: true, // IMPORTANT: Allows sending and receiving HTTP-only cookies for auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptor for logging/security checks
sjbuApi.interceptors.request.use(
  (config) => {
    // Example: Log the request URL
    console.log(`[API] Request to: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//response interceptor for global error handling or logging
sjbuApi.interceptors.response.use(
  (response) => {
    // Example: Log successful response
    console.log(`[API] Success response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle specific error codes globally (e.g., redirect to login on 401)
    if (error.response) {
      console.error(`[API] Error response (${error.response.status}) from: ${error.config.url}`);
      // if (error.response.status === 401) {
      //   // Handle Unauthorized globally, e.g., clear user state and redirect
      // }
    } else if (error.request) {
      console.error("[API] No response received from server.");
    } else {
      console.error("[API] Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default sjbuApi;