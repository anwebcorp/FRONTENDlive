import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://employeemanagement.company/api/',
  withCredentials: true, // Enable credentials
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Try getting token from multiple sources
    const accessToken = localStorage.getItem('access_token') || 
                       sessionStorage.getItem('access_token');
    
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try both storage locations
        const refreshToken = localStorage.getItem('refreshToken') || 
                           sessionStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          'https://employeemanagement.company/api/token/refresh/',
          { refresh: refreshToken },
          { withCredentials: true }
        );

        if (response.data?.access) {
          // Store in both storage types for compatibility
          localStorage.setItem('access_token', response.data.access);
          sessionStorage.setItem('access_token', response.data.access);
          
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return axiosInstance(originalRequest);
        }
        
        throw new Error('No access token in refresh response');
      } catch (refreshError) {
        // Clear both storage types
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;