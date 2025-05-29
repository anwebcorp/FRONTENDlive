import React, { useEffect, useState } from "react";
// import axios from "axios"; // No longer needed for fetching employees here
import { useNavigate } from "react-router-dom";

export default function Admin({ user, setUser }) {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [pressedEmployeeId, setPressedEmployeeId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to load all profiles from localStorage
    const storedProfiles = localStorage.getItem("allProfiles");
    if (storedProfiles) {
      try {
        const parsedProfiles = JSON.parse(storedProfiles);
        // Filter out the logged-in admin from the list of employees to display
        const ADMIN_ID = 18; // Ensure this matches the ID used in Login.jsx
        const filteredEmployees = parsedProfiles.filter(
          (profile) => profile.id !== ADMIN_ID
        );

        // Map the data to fit your current card structure (adjust as needed)
        const formattedEmployees = filteredEmployees.map((profile) => ({
          id: profile.id,
          name: profile.name,
          username: profile.Job_title, // Using Job_title as username for display, adjust if a real username exists
          email: `${profile.name.toLowerCase().replace(/\s/g, ".")}@example.com`, // Placeholder email
          phone: profile.phone_number,
          website: "N/A", // Not in your provided data
          photo: profile.image.startsWith('/') ? `http://127.0.0.1:8000${profile.image}` : profile.image, // Prepend base URL if it's a relative path
        }));
        setEmployees(formattedEmployees);
      } catch (e) {
        console.error("Failed to parse profiles from localStorage:", e);
        setError("Failed to load employee data from storage.");
      }
    } else {
      setError("No employee data found in storage. Please log in again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("allProfiles"); // Clear all profiles on logout
    navigate("/login");
  };

  function handlePressStart(id) {
    setPressedEmployeeId(id);
    document.body.style.overflow = "hidden";
  }
  function handlePressEnd() {
    setPressedEmployeeId(null);
    document.body.style.overflow = "";
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleFeatureClick = (feature) => {
    setMenuOpen(false);
    setComingSoonFeature(feature);
  };

  // eslint-disable-next-line no-unused-vars
  const closeComingSoon = () => {
    setComingSoonFeature(null);
  };

  // Ensure user object is not null before accessing its properties
  if (!user) {
    // Optionally redirect to login or show a loading state
    return <div className="text-gray-300">Loading user data...</div>;
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen flex flex-col items-center p-6 relative font-sans select-none">
      {/* Admin Dashboard Heading */}
      <h2 className="text-2xl font-semibold mb-2 border-b border-gray-800 pb-2 text-center w-full max-w-6xl relative">
        Admin Dashboard
        {/* Facebook 3 lines menu button top-right */}
        <div className="absolute right-0 top-0">
          <button
            aria-label="Open menu"
            onClick={toggleMenu}
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white p-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-gray-600 transition transform hover:scale-110"
          >
            {/* Facebook style three horizontal bars */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
          {/* Dropdown menu */}
          {menuOpen && (
            <div className="mt-2 absolute right-0 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-lg text-white z-50">
              <button
                onClick={() => handleFeatureClick("Attendance")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition focus:outline-none focus:bg-gray-700"
              >
                Attendance
              </button>
              <button
                onClick={() => handleFeatureClick("Payment")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition focus:outline-none focus:bg-gray-700"
              >
                Payment
              </button>
            </div>
          )}
        </div>
      </h2>

      {/* Logout button below heading */}
      <button
        onClick={handleLogout}
        className="self-center mb-6 flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-600"
      >
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0.297c-6.627 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387 0.6 0.113 0.82-0.258 0.82-0.577 0-0.285-0.01-1.04-0.015-2.04-3.338 0.724-4.042-1.61-4.042-1.61 -0.546-1.387-1.333-1.757-1.333-1.757-1.09-0.745 0.084-0.73 0.084-0.73 1.205 0.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.495 0.997 0.108-0.776 0.418-1.305 0.76-1.605-2.665-0.305-5.466-1.333-5.466-5.93 0-1.31 0.465-2.38 1.235-3.22-0.135-0.303-0.54-1.523 0.105-3.176 0 0 1.005-0.322 3.3-1.23 0.96-0.267 1.98-0.399 3-0.405 1.02 0.006 2.04 0.138 3 0.405 2.28-1.552 3.285-1.23 3.285-1.23 0.645 1.653 0.24 2.873 0.12 3.176 0.765 0.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92 0.429 0.369 0.81 1.096 0.81 2.22 0 1.606-0.015 2.896-0.015 3.286 0 0.315 0.21 0.69 0.825 0.57 4.77-1.59 8.205-6.084 8.205-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        <span className="font-semibold">Log Out</span>
      </button>

      {/* Welcome message */}
      <p className="mb-6 text-base text-center w-full max-w-6xl">
        Welcome,{" "}
        <span className="font-medium text-green-500">{user.name}</span>
      </p>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm text-center w-full max-w-6xl">{error}</p>
      )}

      {/* Employees grid: Always 2 columns grid */}
      <div className={`w-full max-w-6xl grid grid-cols-2 gap-6 ${pressedEmployeeId ? "pointer-events-none" : ""}`}>
        {employees.map((emp) => {
          const isPressed = pressedEmployeeId === emp.id;
          return (
            <div
              key={emp.id}
              className={
                `bg-gray-800 border border-gray-700 rounded-md shadow-md cursor-pointer transition-transform flex flex-col items-center ` +
                (isPressed
                  ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 z-50 p-8 scale-110"
                  : "p-4")
              }
              onMouseDown={() => handlePressStart(emp.id)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(emp.id)}
              onTouchEnd={handlePressEnd}
              onTouchCancel={handlePressEnd}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (isPressed) {
                    handlePressEnd();
                  } else {
                    handlePressStart(emp.id);
                  }
                }
              }}
              role="button"
              aria-pressed={isPressed}
              aria-label={isPressed ? `Expanded details for ${emp.name}` : `View details for ${emp.name}`}
            >
              <img
                src={emp.photo}
                alt={emp.name}
                className={
                  `rounded-full border-2 border-gray-700 object-cover transition-all duration-200 ease-in-out ` +
                  (isPressed ? "w-48 h-48 mb-6 shadow-lg" : "w-24 h-24 mb-2")
                }
              />
              <h3
                className={
                  `font-medium text-gray-200 text-center transition-all duration-200 ease-in-out ` +
                  (isPressed ? "text-3xl mb-3" : "text-lg mb-1")
                }
              >
                {emp.name}
              </h3>
              {isPressed ? (
                <div className="text-gray-400 text-center space-y-2 text-base">
                  <p><strong>Job Title:</strong> {emp.username}</p> {/* Changed from Username to Job Title */}
                  <p><strong>Phone:</strong> {emp.phone}</p>
                  <p><strong>Email:</strong> {emp.email}</p> {/* Display placeholder or actual if available */}
                  <p><strong>Website:</strong> {emp.website}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">{emp.username}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Coming Soon modal */}
      {comingSoonFeature && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
          onClick={() => setComingSoonFeature(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-gray-800 border border-gray-700 p-10 rounded-lg shadow-xl w-full max-w-sm flex flex-col items-center relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-300 text-2xl font-bold leading-none"
              onClick={() => setComingSoonFeature(null)}
              aria-label="Close coming soon modal"
            >
              &times;
            </button>
            {/* Cool style icon */}
            <svg
              className="w-20 h-20 mb-6 text-indigo-500 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
            </svg>
            <h3 className="text-xl font-bold mb-4 text-center text-white">
              {comingSoonFeature} Feature
            </h3>
            <p className="text-gray-400 mb-6 text-center text-lg">Coming Soon!</p>
            <button
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={() => setComingSoonFeature(null)}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}