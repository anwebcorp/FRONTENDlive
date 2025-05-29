import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosInstance"; // Make sure this path is correct
import companyLogo from './assets/logoCompany.jpg'; // Import your logo image

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axiosInstance.post('login/', { username, password });

      console.log("Full API response:", response.data);

      const { token } = response.data;
      let userProfile = null;
      const allProfiles = response.data.profiles;

      const ADMIN_ID = 18;

      if (response.data.profile) {
        userProfile = response.data.profile;
        console.log("Found singular 'profile' in response.");
      }
      else if (allProfiles && allProfiles.length > 0) {
        userProfile = allProfiles.find(p => p.id === ADMIN_ID);

        if (userProfile) {
          console.log(`Found plural 'profiles' in response. Identified user profile with ID: ${userProfile.id}.`);
        } else {
          console.warn(`Admin profile with ID ${ADMIN_ID} not found in the 'profiles' array.`);
        }
      }

      if (token && token.access && token.refresh && userProfile && typeof userProfile.id === "number") {
        localStorage.setItem("accessToken", token.access);
        localStorage.setItem("refreshToken", token.refresh);
        localStorage.setItem("user", JSON.stringify(userProfile));
        localStorage.setItem("allProfiles", JSON.stringify(allProfiles));

        console.log("Tokens, user, and all profiles stored in localStorage.");
        console.log("User ID from API:", userProfile.id);

        setUser(userProfile);

        console.log("Admin ID constant:", ADMIN_ID);
        console.log("Is user an admin? (userProfile.id === ADMIN_ID):", userProfile.id === ADMIN_ID);

        if (userProfile.id === ADMIN_ID) {
          console.log("Login Successful as Admin. Navigating to /admin");
          navigate("/admin", { replace: true });
        } else {
          console.log("Login Successful as Employee. Navigating to /employee");
          navigate("/employee", { replace: true });
        }
      } else {
        console.warn("Login successful, but required data (tokens or user profile with valid ID) missing or malformed:", { responseData: response.data, finalUserProfile: userProfile });
        setError("Login failed: Incomplete or malformed user data received from server. Please try again.");
      }
    } catch (err) {
      console.error("Login API request error:", err);

      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);

        if (err.response.data && err.response.data.msg) {
          setError(err.response.data.msg);
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError("Invalid username or password. Please check your credentials.");
        } else {
          setError("An unexpected server error occurred. Please try again later.");
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("Network error: Could not connect to the server. Please check your internet connection.");
      } else {
        console.error("Error setting up request:", err.message);
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 font-sans p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        {/* Company Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={companyLogo}
            alt="Company Logo"
            className="w-32 h-auto object-contain rounded-full shadow-md border-2 border-neutral-200"
          />
        </div>

        {/* Title/Header area */}
        <div className="text-center mb-6">
          <p className="text-neutral-600 text-sm">Enter your credentials to continue</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Username/Email Input */}
          <div>
            <label className="block text-neutral-700 text-sm font-medium mb-1" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-50 text-neutral-900 placeholder-neutral-500 text-base shadow-sm"
              placeholder="Your username"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-neutral-700 text-sm font-medium mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-50 text-neutral-900 placeholder-neutral-500 text-base shadow-sm"
              placeholder="Your password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center py-2 bg-red-100 rounded-lg px-4">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out text-lg"
          >
            Log In
          </button>

          {/* Forgot Password (Optional, but common in iOS login) */}
          <div className="text-center pt-2">
            {/* You can add a "Forgot Password?" link here if needed */}
          </div>
        </form>
      </div>
    </div>
  );
}