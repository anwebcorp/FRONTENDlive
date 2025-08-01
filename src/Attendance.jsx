import React, { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "./axiosInstance"; // Use the provided axiosInstance

// Helper function to format date for display
const formatDateForDisplay = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to capitalize the first letter of a string
const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const Attendance = ({ employeeId: propEmployeeId, employeeName: propEmployeeName, onBack }) => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // Stores daily attendance as {employeeId: {date: status, ...}}
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Current date for marking
  const [attendanceStatusToday, setAttendanceStatusToday] = useState({}); // To disable buttons after marking for the selected date
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null); // For history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [backendSheets, setBackendSheets] = useState([]); // To store raw backend data for sheet management
  const [error, setError] = useState(null); // State for error handling
  const [loading, setLoading] = useState(true); // Loading state

  // New states for managing different views and summary data
  const [viewMode, setViewMode] = useState('dailyMarking'); // 'dailyMarking', 'employeeSummary', 'allSummary'
  const [employeeOverallSummary, setEmployeeOverallSummary] = useState([]); // Specific employee's monthly summaries
  const [allEmployeesOverallSummary, setAllEmployeesOverallSummary] = useState([]); // All employees' monthly summaries
  // ⭐ UPDATED: States for nested accordion
  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedMonthInYear, setExpandedMonthInYear] = useState(null);

  // Effect to fetch initial daily attendance data and all employees
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      let uniqueEmployees = {};
      let newAttendanceRecords = {};
      let fetchedBackendSheets = [];

      try {
        // Fetch all attendance sheets as the primary source for attendance records and employee list
        const attendanceResponse = await axiosInstance.get("admin/all/");
        console.log("[Attendance] Full response from admin/all/:", attendanceResponse.data);
        fetchedBackendSheets = attendanceResponse.data;
        setBackendSheets(fetchedBackendSheets); // Store raw backend data

        // Process attendance data to populate records and employees
        fetchedBackendSheets.forEach((sheet) => {
          // FIX: Changed sheet.profile.id to sheet.profile because backend sends profile as ID directly
          if (!uniqueEmployees[sheet.profile]) { // Check if employee is already added by their profile ID
            uniqueEmployees[sheet.profile] = { // Use sheet.profile as the ID
              id: sheet.profile, // Assign sheet.profile directly as the ID
              name: sheet.profile_name, // Use profile_name from sheet as primary source for employee name
            };
          }
          if (!newAttendanceRecords[sheet.profile]) {
            newAttendanceRecords[sheet.profile] = {};
          }
          sheet.entries.forEach((entry) => {
            newAttendanceRecords[sheet.profile][entry.date] = entry.status; // Use sheet.profile for record key
          });
        });

      } catch (attendanceErr) {
        console.error("Error fetching attendance sheets from 'admin/all/':", attendanceErr);
        setError("Failed to load attendance data. Please ensure backend is running and 'admin/all/' is accessible.");
        setEmployees([]); // Clear employees if primary attendance data fails
        setAttendanceRecords({});
        setLoading(false);
        return; // Stop further execution if critical data fetch fails
      }

      setEmployees(Object.values(uniqueEmployees));
      setAttendanceRecords(newAttendanceRecords);

      // Set initial attendance status for the selected date for daily marking
      const initialStatus = {};
      Object.values(uniqueEmployees).forEach(emp => {
        const record = newAttendanceRecords[emp.id]?.[selectedDate];
        initialStatus[emp.id] = record || null; // 'Present', 'Absent', 'Leave', or null if not marked
      });
      setAttendanceStatusToday(initialStatus);
      setLoading(false);
    };

    fetchInitialData();
  }, [selectedDate]); // Re-run if selectedDate changes

  // Function to fetch specific employee's monthly summaries (now filters from all sheets)
  const fetchEmployeeOverallSummary = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      // Re-fetch all sheets to ensure latest data, then filter on the frontend
      const response = await axiosInstance.get("admin/all/");
      const allSheets = response.data;
      const filteredSheets = allSheets.filter(sheet => sheet.profile === id); // FIX: sheet.profile instead of sheet.profile.id
      setEmployeeOverallSummary(filteredSheets);
    } catch (err) {
      console.error(`Error fetching summary for employee ${id}:`, err);
      setError(`Failed to load overall attendance for this employee. Ensure the backend endpoint 'admin/all/' exists and is correctly implemented.`);
      setEmployeeOverallSummary([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch all employees' monthly summaries
  const fetchAllEmployeesOverallSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("admin/all/");
      setAllEmployeesOverallSummary(response.data);
      // ⭐ Reset expanded states when new data is fetched
      setExpandedYear(null);
      setExpandedMonthInYear(null);
    } catch (err) {
      console.error("Error fetching all employees summary:", err);
      setError("Failed to load overall attendance for all employees. Ensure 'admin/all/' endpoint is accessible and returns summary data.");
      setAllEmployeesOverallSummary([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ⭐ NEW: Grouped attendance data for nested accordion structure (Year -> Month -> Sheets)
  const groupedAttendanceByYearAndMonth = useMemo(() => {
    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const grouped = allEmployeesOverallSummary.reduce((acc, sheet) => {
      const yearKey = sheet.year.toString();
      const monthKey = capitalize(sheet.month);

      if (!acc[yearKey]) {
        acc[yearKey] = {};
      }
      if (!acc[yearKey][monthKey]) {
        acc[yearKey][monthKey] = [];
      }
      acc[yearKey][monthKey].push(sheet);
      return acc;
    }, {});

    // Sort years descending, then months descending within each year
    const sortedYears = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));
    const sortedGrouped = {};
    sortedYears.forEach(year => {
      const monthsInYear = Object.keys(grouped[year]).sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a));
      sortedGrouped[year] = {};
      monthsInYear.forEach(month => {
        // Sort sheets within each month by employee name
        sortedGrouped[year][month] = grouped[year][month].sort((a, b) => a.profile_name.localeCompare(b.profile_name));
      });
    });

    return sortedGrouped;
  }, [allEmployeesOverallSummary]);


  // Handle marking daily attendance
  const handleMarkAttendance = useCallback(async (employeeId, status) => {
    setError(null);
    const currentMonth = new Date(selectedDate).toLocaleString("default", { month: "long" });
    const currentYear = new Date(selectedDate).getFullYear();

    console.log(`[Attendance] Marking attendance for Employee ID: ${employeeId}, Status: ${status}, Date: ${selectedDate}`);
    console.log(`[Attendance] Current Month: ${currentMonth}, Current Year: ${currentYear}`);

    let sheetToModify = backendSheets.find(
      (sheet) =>
        sheet.profile === employeeId && // FIX: Changed sheet.profile.id to sheet.profile
        capitalize(sheet.month) === capitalize(currentMonth) &&
        sheet.year === currentYear
    );
    console.log("[Attendance] Initial local sheet check (backendSheets.find):", sheetToModify ? `Found sheet ID ${sheetToModify.id}` : "Not found locally.");

    let url;
    let method;
    let payload;

    try {
      const newEntry = {
        date: selectedDate,
        status: status,
        day: new Date(selectedDate).toLocaleString("en-US", { weekday: "long" }),
      };
      console.log("[Attendance] New Daily Entry:", newEntry);


      if (sheetToModify) {
        let updatedEntries;
        const existingEntryIndex = sheetToModify.entries.findIndex((e) => e.date === selectedDate);

        if (existingEntryIndex > -1) {
          updatedEntries = sheetToModify.entries.map((entry, idx) =>
            idx === existingEntryIndex ? { ...entry, status: status } : entry
          );
          console.log(`[Attendance] Updating existing entry for date ${selectedDate} in sheet ID ${sheetToModify.id}.`);
        } else {
          updatedEntries = [...sheetToModify.entries, newEntry];
          console.log(`[Attendance] Adding new entry for date ${selectedDate} to existing sheet ID ${sheetToModify.id}.`);
        }

        url = `admin/sheet/${sheetToModify.id}/`;
        method = "put";
        payload = {
          profile: employeeId, // Keep 'profile: employeeId' for PUT payload as required by backend
          month: capitalize(currentMonth),
          year: currentYear,
          status: "Saved", // Assuming 'Saved' for updates
          entries: updatedEntries,
        };
        console.log("[Attendance] Decided to perform PUT request.");
      } else {
        url = "admin/create/";
        method = "post";
        payload = {
          profile: employeeId, // 'profile' is required for POST (creation)
          month: capitalize(currentMonth),
          year: currentYear,
          status: "Saved", // Always 'Saved' for new sheets, or 'Draft' if you have an initial state
          entries: [newEntry],
        };
        console.log("[Attendance] Decided to perform POST request (no existing sheet found).");
      }

      console.log("[Attendance] Sending payload:", payload);
      console.log("[Attendance] To URL:", url);
      console.log("[Attendance] Method:", method);

      const response = await axiosInstance[method](url, payload);
      console.log("[Attendance] API Response:", response.data);

      setAttendanceRecords((prevRecords) => ({
        ...prevRecords,
        [employeeId]: {
          ...(prevRecords[employeeId] || {}),
          [selectedDate]: status,
        },
      }));

      // Update backendSheets to reflect the change for further operations
      if (method === "post") {
        setBackendSheets((prevSheets) => [...prevSheets, response.data]);
        console.log("[Attendance] Backend sheets updated (POST).");
      } else {
        setBackendSheets((prevSheets) =>
          prevSheets.map((sheet) =>
            sheet.id === response.data.id ? response.data : sheet
          )
        );
        console.log("[Attendance] Backend sheets updated (PUT).");
      }

      setAttendanceStatusToday((prevStatus) => ({
        ...prevStatus,
        [employeeId]: status, // Mark status directly
      }));
      console.log("[Attendance] Attendance status updated for selected date.");

    } catch (err) {
      console.error("[Attendance] Error marking attendance:", err);
      if (err.response) {
        console.error("[Attendance] Server response data:", err.response.data);
        const errorDetail = err.response.data.detail || JSON.stringify(err.response.data);
        setError(`Failed to mark attendance: ${errorDetail}. Please ensure data is unique or sheet exists.`);
      } else if (err.request) {
        setError("No response from server. Check network connection.");
      } else {
        setError("Error setting up attendance request. Please try again.");
      }
    }
  }, [selectedDate, backendSheets]); // Dependency on backendSheets

  const openHistoryModal = (employee) => {
    setSelectedEmployeeForModal(employee);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setSelectedEmployeeForModal(null);
    setShowHistoryModal(false);
  };

  // ⭐ NEW: Toggle Year accordion
  const toggleYearAccordion = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null); // Collapse the current year
      setExpandedMonthInYear(null); // Also collapse any month within it
    } else {
      setExpandedYear(year); // Expand the new year
      setExpandedMonthInYear(null); // Collapse any previously expanded month
    }
  };

  // ⭐ NEW: Toggle Month accordion within a year
  const toggleMonthAccordion = (month) => {
    setExpandedMonthInYear(prevMonth => (prevMonth === month ? null : month));
  };


  // Trigger fetching summaries when viewMode changes
  useEffect(() => {
    if (viewMode === 'employeeSummary' && propEmployeeId) {
      fetchEmployeeOverallSummary(propEmployeeId);
    } else if (viewMode === 'allSummary') {
      fetchAllEmployeesOverallSummary();
    }
  }, [viewMode, propEmployeeId, fetchEmployeeOverallSummary, fetchAllEmployeesOverallSummary]);

  // Handle back button for the entire component
  const handleBackToAdmin = () => {
    if (viewMode !== 'dailyMarking') {
      setViewMode('dailyMarking'); // Go back to daily marking view first
      setExpandedYear(null); // Collapse all accordions
      setExpandedMonthInYear(null);
    } else {
      onBack(); // If already in daily marking, go back to Admin.jsx
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-blue-600">Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm text-red-600 hover:text-red-800 focus:outline-none"
        >
          Clear Error
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Attendance Dashboard</h2>
        <button
          onClick={handleBackToAdmin}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg shadow-md transition duration-200 font-bold hover:shadow-lg" // More padding, bolder, stronger hover shadow
        >
          {viewMode !== 'dailyMarking' ? 'Back to Daily Marking' : 'Back to Admin'}
        </button>
      </div>

      {/* Conditional Rendering based on viewMode */}
      {viewMode === 'dailyMarking' && (
        <>
          <div className="mb-6">
            <label htmlFor="date-select" className="block text-lg font-medium text-gray-700 mb-2">
              Select Date:
            </label>
            <input
              type="date"
              id="date-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status on {formatDateForDisplay(selectedDate)}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    History
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.length > 0 ? (
                  employees.map((employee) => {
                    console.log("Rendering employee:", employee);
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              attendanceStatusToday[employee.id] === "Present"
                                ? "bg-green-100 text-green-800"
                                : attendanceStatusToday[employee.id] === "Absent"
                                ? "bg-red-100 text-red-800"
                                : attendanceStatusToday[employee.id] === "Leave"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {attendanceRecords[employee.id]?.[selectedDate] || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleMarkAttendance(employee.id, "Present")}
                              disabled={attendanceStatusToday[employee.id] === "Present"}
                              className={`px-6 py-3 rounded-lg text-white shadow-lg transition duration-200 font-bold hover:shadow-xl hover:scale-105 ${ // Increased padding, shadow, bold, hover effects
                                attendanceStatusToday[employee.id] === "Present"
                                  ? "bg-green-500 cursor-not-allowed" // Slightly lighter for disabled
                                  : "bg-green-700 hover:bg-green-800"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(employee.id, "Absent")}
                              disabled={attendanceStatusToday[employee.id] === "Absent"}
                              className={`px-6 py-3 rounded-lg text-white shadow-lg transition duration-200 font-bold hover:shadow-xl hover:scale-105 ${ // Increased padding, shadow, bold, hover effects
                                attendanceStatusToday[employee.id] === "Absent"
                                  ? "bg-red-500 cursor-not-allowed"
                                  : "bg-red-700 hover:bg-red-800"
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(employee.id, "Leave")}
                              disabled={attendanceStatusToday[employee.id] === "Leave"}
                              className={`px-6 py-3 rounded-lg text-white shadow-lg transition duration-200 font-bold hover:shadow-xl hover:scale-105 ${ // Increased padding, shadow, bold, hover effects
                                attendanceStatusToday[employee.id] === "Leave"
                                  ? "bg-yellow-500 cursor-not-allowed"
                                  : "bg-yellow-700 hover:bg-yellow-800"
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => openHistoryModal(employee)}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-200 hover:shadow-md transition duration-200 font-semibold" // Styled as a distinct secondary button
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No employees found or loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            {propEmployeeId && propEmployeeName && (
                <button
                onClick={() => setViewMode('employeeSummary')}
                className="bg-purple-700 hover:bg-purple-800 text-white px-7 py-3 rounded-lg shadow-lg transition duration-200 font-bold hover:shadow-xl hover:scale-105" // Bolder, stronger shadow, hover effects
                >
                View {propEmployeeName}'s Overall Attendance
                </button>
            )}
            <button
              onClick={() => setViewMode('allSummary')}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-7 py-3 rounded-lg shadow-lg transition duration-200 font-bold hover:shadow-xl hover:scale-105" // Bolder, stronger shadow, hover effects
            >
              View All Employees Overall Attendance
            </button>
          </div>
        </>
      )}

      {/* Individual Employee Overall Summary View */}
      {viewMode === 'employeeSummary' && propEmployeeId && propEmployeeName && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Overall Attendance for {propEmployeeName}</h3>
          {employeeOverallSummary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Month & Year</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Present</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Absent</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Days Marked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employeeOverallSummary.map(sheet => (
                    <tr key={sheet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {capitalize(sheet.month)} {sheet.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-700">
                        {sheet.summary.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-700">
                        {sheet.summary.absent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-700">
                        {sheet.summary.leave}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {sheet.summary.present + sheet.summary.absent + sheet.summary.leave}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No overall attendance data found for {propEmployeeName}.</p>
          )}
        </div>
      )}

      {/* All Employees Overall Summary View (Nested Accordion Style: Year -> Month) */}
      {viewMode === 'allSummary' && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Overall Attendance for All Employees</h3>

          {Object.keys(groupedAttendanceByYearAndMonth).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedAttendanceByYearAndMonth).map(([year, monthsData]) => (
                <div key={year} className="border border-gray-200 rounded-lg shadow-sm">
                  {/* Year Accordion Header */}
                  <button
                    className="flex justify-between items-center w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 rounded-lg focus:outline-none transition duration-200"
                    onClick={() => toggleYearAccordion(year)}
                  >
                    <span className="text-lg font-bold text-blue-800">
                      {year}
                    </span>
                    <svg
                      className={`w-6 h-6 text-blue-600 transition-transform duration-200 ${
                        expandedYear === year ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {/* Year Accordion Content (Months) */}
                  {expandedYear === year && (
                    <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                      {Object.entries(monthsData).map(([month, sheets]) => (
                        <div key={month} className="border border-gray-100 rounded-md shadow-sm">
                          {/* Month Accordion Header */}
                          <button
                            className="flex justify-between items-center w-full px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-md focus:outline-none transition duration-200"
                            onClick={() => toggleMonthAccordion(month)}
                          >
                            <span className="text-md font-semibold text-gray-700">
                              {month}
                            </span>
                            <svg
                              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                expandedMonthInYear === month ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>

                          {/* Month Accordion Content (Employee Table) */}
                          {expandedMonthInYear === month && (
                            <div className="p-3 bg-white border-t border-gray-100 overflow-x-auto">
                              <table className="min-w-full bg-white">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Present</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Absent</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Days Marked</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {sheets.map(sheet => (
                                    <tr key={sheet.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sheet.profile_name}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-green-700">
                                        {sheet.summary.present}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-red-700">
                                        {sheet.summary.absent}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-yellow-700">
                                        {sheet.summary.leave}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-700">
                                        {sheet.summary.present + sheet.summary.absent + sheet.summary.leave}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No overall attendance data found for all employees.</p>
          )}
        </div>
      )}

      {/* History Modal (reused) */}
      {showHistoryModal && selectedEmployeeForModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Attendance History for {selectedEmployeeForModal.name}
            </h3>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords[selectedEmployeeForModal.id] &&
                  Object.entries(attendanceRecords[selectedEmployeeForModal.id])
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                    .map(([date, status]) => (
                      <tr key={date} className="border-b">
                        <td className="px-4 py-4 text-gray-700">{formatDateForDisplay(date)}</td>
                        <td
                          className={`px-4 py-4 text-center font-semibold ${
                            status === "Present" ? "text-green-600" : status === "Absent" ? "text-red-600" : "text-yellow-600"
                          }`}
                        >
                          {status}
                        </td>
                      </tr>
                    ))}
                {(!attendanceRecords[selectedEmployeeForModal.id] || Object.keys(attendanceRecords[selectedEmployeeForModal.id]).length === 0) && (
                  <tr key="no-records-row">
                    <td colSpan="2" className="px-4 py-4 text-center text-gray-500">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              onClick={closeHistoryModal}
              className="mt-4 bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-lg shadow-md transition font-bold hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;