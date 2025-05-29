import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// A generic component to display setting details, simulating an iPhone detail view
// This component will always be rendered, but its position controlled by CSS transform
function SettingDetail({ title, content, onBack, isVisible }) {
  return (
    <div
      className={`fixed inset-0 bg-neutral-50 z-20 flex flex-col font-sans
                   transition-transform duration-300 ease-out
                   ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Top Navigation Bar for Detail View */}
      <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-center">
        {/* Title is now darker for better visibility */}
        <h1 className="text-xl font-semibold text-neutral-900 text-center">{title}</h1>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pt-4 pb-8">
        <div className="mx-4 rounded-xl overflow-hidden shadow-sm">
          <ul className="bg-white divide-y divide-neutral-200">
            <li className="flex justify-between items-center py-3 px-4">
              {/* Text is darker for better visibility */}
              <span className="text-neutral-800">{title}</span>
              {/* Content text is also darker for better visibility */}
              <span className="text-neutral-600">{content}</span>
            </li>
          </ul>
        </div>

        {/* Keeping the "Go Back" Button at the bottom of the content area */}
        <div className="mx-4 mt-5 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={onBack}
            className="w-full py-3 bg-white text-blue-600 font-normal text-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-100 ease-in-out"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employee({ user, setUser }) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState(null);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate("/login");
  };

  const name = user?.name || "N/A";
  const cnic = user?.cnic || "N/A";
  const phone_number = user?.phone_number || "N/A";
  const address = user?.address || "N/A";
  const job_title = user?.Job_title || user?.job_title || "N/A";

  useEffect(() => {
    const fetchImage = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        handleLogout();
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:8000/api/profile/", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setImageUrl(`http://127.0.0.1:8000${data.profile.image}`);
      } catch (error) {
        console.error("Error fetching image:", error);
        setError("Failed to load profile image.");
      }
    };

    fetchImage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSettingClick = (settingName, settingContent) => {
    setSelectedSetting({ title: settingName, content: settingContent });
  };

  const handleBackFromDetail = () => {
    setSelectedSetting(null);
  };

  const handleGlobalBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
        <p className="text-red-600 text-center">
          User data missing. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800 relative overflow-hidden">
      {/* Main Settings View Container - This slides out when a detail is active */}
      <div className={`absolute inset-0 transition-transform duration-300 ease-out ${selectedSetting ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Top Navigation Bar Simulation for Main View */}
        <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-between">
          {/* Global Back Button (App History) */}
          <button
            onClick={handleGlobalBack}
            className="text-blue-600 text-lg font-normal flex items-center active:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          {/* Main Settings Title is darker for better visibility */}
          <h1 className="text-xl font-semibold text-center absolute left-1/2 -translate-x-1/2 text-neutral-900">Settings</h1>
          {/* Placeholder for right-side elements to balance title centering */}
          <div className="w-16"></div>
        </div>

        {/* Main Settings Content */}
        <div className="pt-4 pb-8 h-[calc(100vh-60px)] overflow-y-auto">
          {/* User Profile Section (Top Group) */}
          <div className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white p-6 flex flex-col items-center justify-center">
              <div className="flex-shrink-0 mb-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="User Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 text-sm">
                    Loading...
                  </div>
                )}
              </div>
              <div className="text-center">
                {/* User name is darker for better visibility */}
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">{name}</h2>
              </div>
            </div>
          </div>

          {/* Account Details Section (Grouped List with clickable items) */}
          <div className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm">
            <ul className="bg-white divide-y divide-neutral-200">
              {/* CNIC */}
              <li
                className="flex justify-between items-center py-3 px-4 active:bg-neutral-100 cursor-pointer"
                onClick={() => handleSettingClick("CNIC", cnic)}
              >
                {/* Text is darker for better visibility */}
                <span className="text-neutral-800">CNIC</span>
                {/* Icon color adjusted for better visibility */}
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
              {/* Phone Number */}
              <li
                className="flex justify-between items-center py-3 px-4 active:bg-neutral-100 cursor-pointer"
                onClick={() => handleSettingClick("Phone Number", phone_number)}
              >
                {/* Text is darker for better visibility */}
                <span className="text-neutral-800">Phone Number</span>
                {/* Icon color adjusted for better visibility */}
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
              {/* Address */}
              <li
                className="flex justify-between items-center py-3 px-4 active:bg-neutral-100 cursor-pointer"
                onClick={() => handleSettingClick("Address", address)}
              >
                {/* Text is darker for better visibility */}
                <span className="text-neutral-800">Address</span>
                {/* Icon color adjusted for better visibility */}
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
              {/* Job Title */}
              <li
                className="flex justify-between items-center py-3 px-4 active:bg-neutral-100 cursor-pointer"
                onClick={() => handleSettingClick("Job Title", job_title)}
              >
                {/* Text is darker for better visibility */}
                <span className="text-neutral-800">Job Title</span>
                {/* Icon color adjusted for better visibility */}
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
            </ul>
          </div>

          {/* New Sections */}
          <div className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm">
            <ul className="bg-white divide-y divide-neutral-200">
              {/* Attendance */}
              <li
                className="flex justify-between items-center py-3 px-4 active:bg-neutral-100 cursor-pointer"
                onClick={() => handleSettingClick("Attendance", "Coming Soon")}
              >
                {/* Text is darker for better visibility */}
                <span className="text-neutral-800">Attendance</span>
                {/* Icon color adjusted for better visibility */}
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
              {/* Payment */}
              <li
                className="flex justify-between items-center py-3 px-4 active:bg-neutral-100 cursor-pointer"
                onClick={() => handleSettingClick("Payment", "Coming Soon")}
              >
                {/* Text is darker for better visibility */}
                <span className="text-neutral-800">Payment</span>
                {/* Icon color adjusted for better visibility */}
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
            </ul>
          </div>

          <div className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm">
            <ul className="bg-white divide-y divide-neutral-200">
              {/* Developer Information */}
              <li
                className="flex justify-between items-center py-3 px-4 active:bg-neutral-100 cursor-pointer"
                onClick={() => handleSettingClick("Developer Information", "A&N Corps")}
              >
                {/* Text is darker for better visibility */}
                <span className="text-neutral-800">Developer Information</span>
                {/* Icon color adjusted for better visibility */}
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
            </ul>
          </div>

          {error && (
            <p className="text-red-600 text-center mt-2 px-4 text-sm">
              {error}
            </p>
          )}

          {/* Logout Button (Distinct Group/Action) */}
          <div className="mx-4 mt-5 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white text-red-600 font-normal text-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors duration-100 ease-in-out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Detail View - Always rendered, its position controlled by `isVisible` prop */}
      <SettingDetail
        title={selectedSetting?.title || ""}
        content={selectedSetting?.content || ""}
        onBack={handleBackFromDetail}
        isVisible={!!selectedSetting}
      />
    </div>
  );
}