import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                localStorage.removeItem('user');

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

            }

           

            if (error.response.status === 403) {
                console.error('Access forbidden: Insufficient permissions');

            }

            if (error.response.status === 500) {
                console.error('Server error: Please try again later');
            }

            return Promise.reject(error);
        } else if (error.request) {
            console.error('Network error: Unable to reach the server');
        } else {
            console.error('Error:', error.message);
        }
    }
)

export default axiosInstance;