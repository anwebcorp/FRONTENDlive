import { useEffect } from "react";
import axiosInstance from "./axiosInstance";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        // Request: Attach access token
        const requestIntercept = axiosInstance.interceptors.request.use(
            (config) => {
                if (!config.headers["Authorization"]) {
                    const token = auth?.accessToken || localStorage.getItem("access_token");
                    if (token) {
                        config.headers["Authorization"] = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response: Refresh on 401
        const responseIntercept = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?._retry) {
                    prevRequest._retry = true;
                    try {
                        const newAccessToken = await refresh();
                        prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                        return axiosInstance(prevRequest);
                    } catch (refreshError) {
                        // Optionally: clear storage and redirect to login
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept);
            axiosInstance.interceptors.response.eject(responseIntercept);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth, refresh]);

    return axiosInstance;
};

export default useAxiosPrivate;