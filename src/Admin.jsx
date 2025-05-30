import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin({ user, setUser }) {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(null); // For Attendance/Payment

  const navigate = useNavigate();

  useEffect(() => {
    const storedProfiles = localStorage.getItem("allProfiles");
    if (storedProfiles) {
      try {
        const parsedProfiles = JSON.parse(storedProfiles);
        const ADMIN_ID = 18;
        const filteredEmployees = parsedProfiles.filter(
          (profile) => profile.id !== ADMIN_ID
        );

        const formattedEmployees = filteredEmployees.map((profile) => ({
          id: profile.id,
          name: profile.name,
          username: profile.Job_title,
          phone_number: profile.phone_number,
          address: profile.address || "N/A",
          cnic: profile.cnic || "N/A",
          employee_id: profile.employee_id || "N/A",
          joining_date: profile.joining_date || "N/A",
          time_since_joining: profile.time_since_joining || "N/A", // This message will be displayed
          Job_title: profile.Job_title || "N/A",
          photo: profile.image.startsWith('/') ? `http://127.0.0.1:8000${profile.image}` : profile.image,
        }));
        setEmployees(formattedEmployees);
      } catch (e) {
        console.error("Failed to parse profiles from localStorage:", e);
        setError("Failed to load employee data from storage.");
      }
    } else {
      setError("No employee data found in storage. Please log in again.");
    }
  }, []);

  // Handles the auto-hide for the "Coming Soon" message
  useEffect(() => {
    if (showComingSoon) {
      const timer = setTimeout(() => {
        setShowComingSoon(null);
      }, 3000); // "Coming Soon" message disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showComingSoon]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("allProfiles");
    navigate("/login");
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowComingSoon(null); // Clear any "Coming Soon" message when switching employees
  };

  const handleBackFromEmployeeDetail = () => {
    setSelectedEmployee(null);
    setShowComingSoon(null); // Clear any "Coming Soon" message when going back
  };

  // This function is only for "Attendance" and "Payment"
  const handleFeatureClick = (feature) => {
    setShowComingSoon(feature);
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

  // --- Employee Detail View (Inner Component, defined here for single file) ---
  const EmployeeDetailView = ({ employee, onBack, isVisible }) => {
    if (!employee) {
      return null;
    }

    const displayData = Object.entries(employee).filter(([key]) =>
      ![
        'user', 'id', 'photo', 'username', 'time_since_joining', 'email', 'employee_id'
      ].includes(key)
    );

    return (
      <div
        className={`fixed inset-0 bg-neutral-50 z-20 flex flex-col font-sans
                     transition-transform duration-300 ease-out
                     ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Top Navigation Bar for Detail View */}
        <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-start">
          <button
            onClick={onBack}
            className="text-blue-600 text-lg font-normal flex items-center active:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <h1 className="text-xl font-semibold text-neutral-900 text-center absolute left-1/2 -translate-x-1/2">
            {employee.name}
          </h1>
        </div>

        {/* Employee Detail Content */}
        <div className="flex-1 overflow-y-auto pt-4 pb-8">
          <div className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white p-6 flex flex-col items-center justify-center">
              <div className="flex-shrink-0 mb-4">
                <img
                  src={employee.photo}
                  alt={employee.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-600 shadow-md"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">{employee.name}</h2>
                {/* Display Employee ID here, under the name on the detail page */}
                <p className="text-neutral-600 text-sm">ID: {employee.employee_id}</p>
              </div>
            </div>
          </div>

          {/* Dynamic Detail List */}
          <div className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm">
            <ul className="bg-white divide-y divide-neutral-200">
              {displayData.map(([key, value]) => (
                <React.Fragment key={key}>
                  <li
                    className="flex justify-between items-center py-3 px-4"
                    style={{ cursor: 'default' }}
                  >
                    <span className="text-neutral-800 font-medium capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-neutral-600">
                      {value}
                    </span>
                  </li>
                  {/* Display the time_since_joining message directly under the joining_date div */}
                  {key === 'joining_date' && employee.time_since_joining && (
                    <div className="bg-neutral-50 px-4 py-1 text-sm text-neutral-600 border-b border-neutral-200">
                      <span className="font-medium text-neutral-700">Time since joining:</span> {employee.time_since_joining}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mx-4 mt-5 rounded-xl overflow-hidden shadow-sm">
            <ul className="bg-white divide-y divide-neutral-200">
              <li>
                <button
                  onClick={() => handleFeatureClick("Attendance")}
                  className="w-full py-3 text-blue-600 font-normal text-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-100 ease-in-out"
                >
                  Attendance
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFeatureClick("Payment")}
                  className="w-full py-3 text-blue-600 font-normal text-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-100 ease-in-out"
                >
                  Payment
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  // --- End of Employee Detail View ---

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800 relative overflow-hidden">
      {/* Main Admin Dashboard View */}
      <div className={`absolute inset-0 transition-transform duration-300 ease-out ${selectedEmployee ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-between">
          <div className="w-10"></div>
          <h1 className="text-xl font-normal text-neutral-500 text-center absolute left-1/2 -translate-x-1/2">
            <span className="font-semibold text-neutral-900">Admin</span> Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors duration-200 ease-in-out shadow-md"
            title="Sign Out"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span className="absolute right-full mr-3 px-3 py-1 bg-neutral-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 ease-in-out whitespace-nowrap pointer-events-none">
              Sign Out
            </span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="pt-4 pb-8 h-[calc(100vh-60px)] overflow-y-auto">
          <div className="mx-4 mb-5 rounded-xl overflow-hidden">
            <p className="text-base text-center py-2 text-neutral-500">
              Welcome, <span className="font-semibold text-blue-600">{user.name}</span>
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-center mb-4 text-sm px-4">{error}</p>
          )}

          <div className={`w-full max-w-6xl mx-auto grid grid-cols-2 gap-4 ${selectedEmployee ? "pointer-events-none" : ""}`}>
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white border border-neutral-200 rounded-xl shadow-sm cursor-pointer transition-transform duration-200 ease-in-out
                           p-4 flex flex-col items-center hover:shadow-md active:scale-[0.98] active:shadow-sm"
                onClick={() => handleEmployeeClick(emp)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${emp.name}`}
              >
                <img
                  src={emp.photo}
                  alt={emp.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-600 mb-2"
                />
                <h3 className="font-semibold text-neutral-900 text-base mb-1 text-center">
                  {emp.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Detail Page (Slides in) */}
      <EmployeeDetailView
        employee={selectedEmployee}
        onBack={handleBackFromEmployeeDetail}
        isVisible={!!selectedEmployee}
      />

      {/* Coming Soon Message (Overlay) - Only for Attendance/Payment */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-30">
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            <svg
              className="w-16 h-16 mb-4 text-blue-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
            </svg>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{showComingSoon} Feature</h3>
            <p className="text-neutral-600 text-base">Coming Soon!</p>
          </div>
        </div>
      )}
    </div>
  );
}