// your_react_project/src/pages/Admin.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from './axiosInstance'; // Make sure this path is correct relative to Admin.jsx
import json from "json-bigint"; // Import json-bigint to handle potential large integers if your API returns them.
                                 // If you don't have this, install it: npm install json-bigint

// Import EmployeeDocuments component
import EmployeeDocuments from './EmployeeDocuments'; // Make sure this path is correct relative to Admin.jsx

// Import a placeholder image.
const DEFAULT_AVATAR_PLACEHOLDER = "https://placehold.co/150x150/CCCCCC/FFFFFF?text=NO+IMAGE";


export default function Admin({ user, setUser }) {
    const [employees, setEmployees] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showComingSoon, setShowComingSoon] = useState(null); // For Attendance/Payment

    // State for the new employee creation form
    const [newEmployeeData, setNewEmployeeData] = useState({
        name: "",
        cnic: "",
        phone_number: "",
        address: "",
        Job_title: "",
        image: null, // For file input
        employee_id: "",
        joining_date: "",
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
    });
    const [showCreateForm, setShowCreateForm] = useState(false); // To toggle the form visibility
    const [createEmployeeError, setCreateEmployeeError] = useState(null);
    const [createEmployeeSuccess, setCreateEmployeeSuccess] = useState(false);

    // State for the employee edit form
    const [showEditForm, setShowEditForm] = useState(false); // To toggle the edit form visibility
    const [currentEmployeeToEdit, setCurrentEmployeeToEdit] = useState(null); // Employee data for the edit form
    const [editEmployeeError, setEditEmployeeError] = useState(null);
    const [editEmployeeSuccess, setEditEmployeeSuccess] = useState(false);

    // New state for managing EmployeeDocuments visibility and data
    const [showDocuments, setShowDocuments] = useState(false);
    const [employeeForDocuments, setEmployeeForDocuments] = useState(null);

    const navigate = useNavigate();

    // Function to fetch and set employee data
    const fetchEmployees = async () => {
        try {
            // Attempt to fetch fresh data from the API
            const response = await axiosInstance.get('/profile/'); // Assuming this endpoint fetches all profiles
            if (response.data && response.data.profiles && response.data.profiles.length > 0) {
                localStorage.setItem("allProfiles", JSON.stringify(response.data.profiles));
                processAndSetEmployees(response.data.profiles);
                setError(null); // Clear any previous error if data is successfully fetched
            } else {
                // If API returns no profiles or unexpected data structure, try local storage
                const storedProfiles = localStorage.getItem("allProfiles");
                if (storedProfiles) {
                    processAndSetEmployees(json.parse(storedProfiles)); // Use json.parse if using json-bigint
                    setError(null); // No error if data is loaded from storage
                } else {
                    // No data from API and no data in local storage
                    setError("No employee data found. Please log in again.");
                }
            }
        } catch (apiError) {
            console.error("Failed to fetch profiles from API:", apiError);
            // On API error, always attempt to load from local storage first.
            const storedProfiles = localStorage.getItem("allProfiles");
            if (storedProfiles) {
                try {
                    processAndSetEmployees(json.parse(storedProfiles)); // Use json.parse if using json-bigint
                    setError("Failed to load employee data from server. Loaded from storage.");
                } catch (e) {
                    console.error("Failed to parse profiles from localStorage after API error:", e);
                    setError("Failed to load employee data from storage.");
                }
            } else {
                setError("No employee data found. Please log in again.");
            }
        }
    };

    // Helper function to process and set employees
    const processAndSetEmployees = (profiles) => {
        const ADMIN_ID = 18; // Your admin ID
        const filteredEmployees = profiles.filter(
            (profile) => profile.id !== ADMIN_ID
        );

        const formattedEmployees = filteredEmployees.map((profile) => ({
            id: profile.id,
            name: profile.name,
            // Assuming the API returns a 'user' object nested within the profile
            username: profile.user?.username || 'N/A', // Access nested user.username
            email: profile.user?.email || 'N/A',       // Access nested user.email
            first_name: profile.user?.first_name || '',
            last_name: profile.user?.last_name || '',
            phone_number: profile.phone_number,
            address: profile.address || "N/A",
            cnic: profile.cnic || "N/A",
            employee_id: profile.employee_id || "N/A",
            joining_date: profile.joining_date || "N/A",
            time_since_joining: profile.time_since_joining || "N/A", // This message will be displayed
            Job_title: profile.Job_title || "N/A",
            // FIX: Ensure 'photo' always has a valid URL. Use placeholder if profile.image is null, empty, or not a valid path.
            photo: (profile.image && typeof profile.image === 'string' && profile.image.startsWith('/'))
                ? `http://127.0.0.1:8000${profile.image}`
                : DEFAULT_AVATAR_PLACEHOLDER,
        }));
        setEmployees(formattedEmployees);
    };

    useEffect(() => {
        fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Fetch employees on component mount

    // Handles the auto-hide for the "Coming Soon" message
    useEffect(() => {
        if (showComingSoon) {
            const timer = setTimeout(() => {
                setShowComingSoon(null);
            }, 3000); // "Coming Soon" message disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [showComingSoon]);

    // Handles success/error messages for employee creation
    useEffect(() => {
        if (createEmployeeSuccess || createEmployeeError) {
            const timer = setTimeout(() => {
                setCreateEmployeeSuccess(false);
                setCreateEmployeeError(null);
            }, 5000); // Messages disappear after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [createEmployeeSuccess, createEmployeeError]);

    // Handles success/error messages for employee update
    useEffect(() => {
        if (editEmployeeSuccess || editEmployeeError) {
            const timer = setTimeout(() => {
                setEditEmployeeSuccess(false);
                setEditEmployeeError(null);
            }, 5000); // Messages disappear after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [editEmployeeSuccess, editEmployeeError]);


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

    // Handler for managing employee documents
    const handleManageDocumentsClick = (employee) => {
        setEmployeeForDocuments(employee);
        setShowDocuments(true);
        setSelectedEmployee(null); // Hide detail view when opening documents view
    };

    // Handler to go back from employee documents view
    const handleBackFromDocuments = () => {
        setShowDocuments(false);
        setEmployeeForDocuments(null);
        // Optionally, you might want to go back to the employee detail view
        // if that's the desired flow, e.g., setSelectedEmployee(previousSelectedEmployee);
    };

    // New employee form input handlers
    const handleNewEmployeeInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployeeData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleNewEmployeeFileChange = (e) => {
        setNewEmployeeData((prevData) => ({ ...prevData, image: e.target.files[0] }));
    };

    const handleCreateEmployeeSubmit = async (e) => {
        e.preventDefault();
        setCreateEmployeeError(null);
        setCreateEmployeeSuccess(false);

        const formData = new FormData();
        // Append all fields from newEmployeeData that belong to the Profile model directly
        // EXCLUDING 'user' fields (username, email, etc.) and 'image'
        for (const key in newEmployeeData) {
            if (newEmployeeData[key] !== null && ![
                'image', 'username', 'email', 'first_name', 'last_name', 'password'
            ].includes(key)) {
                formData.append(key, newEmployeeData[key]);
            }
        }

        // Append the image file if it exists
        if (newEmployeeData.image) {
            formData.append('image', newEmployeeData.image);
        }

        // Create a user object from the input fields
        const userDetails = {
            username: newEmployeeData.username,
            email: newEmployeeData.email,
            first_name: newEmployeeData.first_name,
            last_name: newEmployeeData.last_name,
            password: newEmployeeData.password,
        };
        // Stringify the userDetails object and append it under the 'user' key.
        // Your Django serializer will now explicitly parse this 'user' field.
        formData.append('user', JSON.stringify(userDetails));

        try {
            const response = await axiosInstance.post('/create-employee/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Essential for file uploads
                },
            });
            console.log("Employee created successfully:", response.data);
            setCreateEmployeeSuccess(true);
            // Clear the form
            setNewEmployeeData({
                name: "", cnic: "", phone_number: "", address: "", Job_title: "",
                image: null, employee_id: "", joining_date: "",
                username: "", email: "", first_name: "", last_name: "", password: ""
            });
            setShowCreateForm(false); // Hide the form after successful creation
            fetchEmployees(); // Re-fetch the employee list to show the new employee

        } catch (error) {
            console.error("Error creating employee:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.detail || error.response?.data?.msg ||
                                Object.values(error.response?.data || {}).flat().join(' ') || // Handle DRF validation errors
                                "Unknown error occurred.";
            setCreateEmployeeError(`Failed to create employee: ${errorMessage}`);
        }
    };

    // Edit employee form input handlers
    const handleEditEmployeeInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEmployeeToEdit((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleEditEmployeeFileChange = (e) => {
        setCurrentEmployeeToEdit((prevData) => ({ ...prevData, image: e.target.files[0] }));
    };

    const handleUpdateEmployeeSubmit = async (e) => {
        e.preventDefault();
        setEditEmployeeError(null);
        setEditEmployeeSuccess(false);

        if (!currentEmployeeToEdit || !currentEmployeeToEdit.id) {
            setEditEmployeeError("No employee selected for editing.");
            return;
        }

        const formData = new FormData();
        // Append all fields from currentEmployeeToEdit that belong to the Profile model directly
        // EXCLUDING 'user' fields (username, email, etc.) and 'image'
        for (const key in currentEmployeeToEdit) {
            // Only append if value is not null/undefined and not sensitive user fields
            if (currentEmployeeToEdit[key] !== null && currentEmployeeToEdit[key] !== undefined && ![
                'image', 'username', 'email', 'first_name', 'last_name', 'password', 'time_since_joining', 'user', 'id' // Exclude 'id' as it's in the URL
            ].includes(key)) {
                formData.append(key, currentEmployeeToEdit[key]);
            }
        }

        // Append the image file if it exists and is a new file (not just the URL string)
        if (currentEmployeeToEdit.image && typeof currentEmployeeToEdit.image !== 'string') {
            formData.append('image', currentEmployeeToEdit.image);
        }

        // Create a user object from the input fields
        const userDetails = {
            username: currentEmployeeToEdit.username,
            email: currentEmployeeToEdit.email,
            first_name: currentEmployeeToEdit.first_name,
            last_name: currentEmployeeToEdit.last_name,
            // Do NOT send password here unless you explicitly have a password change field
            // Sending an empty string might clear the password in some DRF setups.
            // If you need to update password, handle it with a separate, secure endpoint.
        };
        // Only append user details if there's something to update in the user model
        // Check if any of the user fields have actual values to be sent
        if (Object.values(userDetails).some(val => val !== null && val !== undefined && val !== '')) {
             formData.append('user', JSON.stringify(userDetails));
        }

        try {
            const response = await axiosInstance.patch(`/update-employee/${currentEmployeeToEdit.id}/`, formData, { // Using PATCH for partial updates
                headers: {
                    'Content-Type': 'multipart/form-data', // Essential for file uploads
                },
            });
            console.log("Employee updated successfully:", response.data);
            setEditEmployeeSuccess(true);
            setShowEditForm(false); // Hide the form after successful update
            setCurrentEmployeeToEdit(null); // Clear the employee data for editing
            fetchEmployees(); // Re-fetch the employee list to show the updated data

        } catch (error) {
            console.error("Error updating employee:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.detail || error.response?.data?.msg ||
                                 Object.values(error.response?.data || {}).flat().join(' ') ||
                                 "Unknown error occurred.";
            setEditEmployeeError(`Failed to update employee: ${errorMessage}`);
        }
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
    const EmployeeDetailView = ({ employee, onBack, isVisible, onManageDocuments }) => {
        if (!employee) {
            return null;
        }

        const displayData = Object.entries(employee).filter(([key]) =>
            ![
                'user', 'id', 'photo', 'username', 'email', 'first_name', 'last_name', // Exclude user fields that will be shown separately
                'time_since_joining', // This is shown below joining_date
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
                                {/* The 'photo' property is now guaranteed to be a valid URL or placeholder */}
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
                            {/* Display User Account details separately if available */}
                            {employee.username && (
                                <>
                                    <li className="bg-neutral-100 px-4 py-2 text-neutral-700 font-semibold text-sm">User Account Details</li>
                                    <li className="flex justify-between items-center py-3 px-4">
                                        <span className="text-neutral-800 font-medium">Username:</span>
                                        <span className="text-neutral-600">{employee.username}</span>
                                    </li>
                                </>
                            )}
                            {employee.email && (
                                <li className="flex justify-between items-center py-3 px-4">
                                    <span className="text-neutral-800 font-medium">Email:</span>
                                    <span className="text-neutral-600">{employee.email}</span>
                                </li>
                            )}
                          
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="mx-4 mt-5 rounded-xl overflow-hidden shadow-sm">
                        <ul className="bg-white divide-y divide-neutral-200">
                            <li>
                                <button
                                    onClick={() => {
                                        // Populate the edit form state with current employee data
                                        setCurrentEmployeeToEdit({
                                            ...employee,
                                            // Make sure image is handled correctly for the file input if it's a URL
                                            image: null, // Clear image for file input, will only update if new file is selected
                                        });
                                        setShowEditForm(true);
                                        setSelectedEmployee(null); // Hide detail view when opening edit form
                                    }}
                                    className="w-full py-3 text-blue-600 font-normal text-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-100 ease-in-out"
                                >
                                    Edit Employee
                                </button>
                            </li>
                            {/* New button for managing documents */}
                            <li>
                                <button
                                    onClick={() => onManageDocuments(employee)}
                                    className="w-full py-3 text-blue-600 font-normal text-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-100 ease-in-out"
                                >
                                    Manage Documents
                                </button>
                            </li>
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
            <div className={`absolute inset-0 transition-transform duration-300 ease-out ${selectedEmployee || showCreateForm || showEditForm || showDocuments ? '-translate-x-full' : 'translate-x-0'}`}>
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

                    {/* Employee Grid with Add New Employee Button */}
                    <div className={`w-full max-w-6xl mx-auto grid grid-cols-2 gap-4 ${selectedEmployee || showDocuments ? "pointer-events-none" : ""}`}>
                        {/* Place the 'Add New Employee' button as the first item */}
                        <button
                            key="add-new-employee-button" // Unique key for the button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-xl shadow-sm cursor-pointer transition-transform duration-200 ease-in-out
                                     p-4 flex flex-col items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:border-neutral-400 active:scale-[0.98] active:shadow-sm"
                            title="Add New Employee"
                        >
                            <svg className="w-16 h-16 mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span className="font-semibold text-lg text-neutral-600">Add New</span>
                        </button>

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
                                {/* The 'photo' property is now guaranteed to be a valid URL or placeholder */}
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
                onManageDocuments={handleManageDocumentsClick} // Pass the new handler
            />

            {/* Create New Employee Form (Slides in) */}
            <div
                className={`fixed inset-0 bg-neutral-50 z-20 flex flex-col font-sans
                                transition-transform duration-300 ease-out
                                ${showCreateForm ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Top Navigation Bar for Create Form */}
                <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-start">
                    <button
                        onClick={() => { setShowCreateForm(false); setCreateEmployeeError(null); setCreateEmployeeSuccess(false); }}
                        className="text-blue-600 text-lg font-normal flex items-center active:text-blue-700"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </button>
                    <h1 className="text-xl font-semibold text-neutral-900 text-center absolute left-1/2 -translate-x-1/2">
                        Create Employee
                    </h1>
                </div>

                {/* Create Employee Form Content */}
                <div className="flex-1 overflow-y-auto pt-4 pb-8">
                    {createEmployeeError && (
                        <p className="text-red-600 text-center mb-4 text-sm px-4">{createEmployeeError}</p>
                    )}
                    {createEmployeeSuccess && (
                        <p className="text-green-600 text-center mb-4 text-sm px-4">Employee created successfully!</p>
                    )}

                    <form onSubmit={handleCreateEmployeeSubmit} className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm p-6 bg-white">
                        <h2 className="text-lg font-semibold text-neutral-800 mb-4 text-center">Employee Profile Details</h2>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-neutral-700 text-sm font-bold mb-2">Full Name:</label>
                            <input type="text" id="name" name="name" value={newEmployeeData.name} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="cnic" className="block text-neutral-700 text-sm font-bold mb-2">CNIC:</label>
                            <input type="text" id="cnic" name="cnic" value={newEmployeeData.cnic} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phone_number" className="block text-neutral-700 text-sm font-bold mb-2">Phone Number:</label>
                            <input type="text" id="phone_number" name="phone_number" value={newEmployeeData.phone_number} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="address" className="block text-neutral-700 text-sm font-bold mb-2">Address:</label>
                            <input type="text" id="address" name="address" value={newEmployeeData.address} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="Job_title" className="block text-neutral-700 text-sm font-bold mb-2">Job Title:</label>
                            <input type="text" id="Job_title" name="Job_title" value={newEmployeeData.Job_title} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="employee_id" className="block text-neutral-700 text-sm font-bold mb-2">Employee ID:</label>
                            <input type="text" id="employee_id" name="employee_id" value={newEmployeeData.employee_id} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="joining_date" className="block text-neutral-700 text-sm font-bold mb-2">Joining Date:</label>
                            <input type="date" id="joining_date" name="joining_date" value={newEmployeeData.joining_date} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="image" className="block text-neutral-700 text-sm font-bold mb-2">Profile Image:</label>
                            <input type="file" id="image" name="image" onChange={handleNewEmployeeFileChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>

                        <h2 className="text-lg font-semibold text-neutral-800 mb-4 mt-6">New User Account Details</h2>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-neutral-700 text-sm font-bold mb-2">Username:</label>
                            <input type="text" id="username" name="username" value={newEmployeeData.username} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-neutral-700 text-sm font-bold mb-2">Email:</label>
                            <input type="email" id="email" name="email" value={newEmployeeData.email} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="first_name" className="block text-neutral-700 text-sm font-bold mb-2">First Name:</label>
                            <input type="text" id="first_name" name="first_name" value={newEmployeeData.first_name} onChange={handleNewEmployeeInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="last_name" className="block text-neutral-700 text-sm font-bold mb-2">Last Name:</label>
                            <input type="text" id="last_name" name="last_name" value={newEmployeeData.last_name} onChange={handleNewEmployeeInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-neutral-700 text-sm font-bold mb-2">Password:</label>
                            <input type="password" id="password" name="password" value={newEmployeeData.password} onChange={handleNewEmployeeInputChange} required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>

                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline">
                            Create Employee
                        </button>
                    </form>
                </div>
            </div>

            {/* Edit Employee Form (Slides in) */}
            <div
                className={`fixed inset-0 bg-neutral-50 z-20 flex flex-col font-sans
                                transition-transform duration-300 ease-out
                                ${showEditForm ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Top Navigation Bar for Edit Form */}
                <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-start">
                    <button
                        onClick={() => { setShowEditForm(false); setEditEmployeeError(null); setEditEmployeeSuccess(false); setCurrentEmployeeToEdit(null); }}
                        className="text-blue-600 text-lg font-normal flex items-center active:text-blue-700"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </button>
                    <h1 className="text-xl font-semibold text-neutral-900 text-center absolute left-1/2 -translate-x-1/2">
                        Edit Employee
                    </h1>
                </div>

                {/* Edit Employee Form Content */}
                <div className="flex-1 overflow-y-auto pt-4 pb-8">
                    {editEmployeeError && (
                        <p className="text-red-600 text-center mb-4 text-sm px-4">{editEmployeeError}</p>
                    )}
                    {editEmployeeSuccess && (
                        <p className="text-green-600 text-center mb-4 text-sm px-4">Employee updated successfully!</p>
                    )}

                    {currentEmployeeToEdit && (
                        <form onSubmit={handleUpdateEmployeeSubmit} className="mx-4 mb-5 rounded-xl overflow-hidden shadow-sm p-6 bg-white">
                            <h2 className="text-lg font-semibold text-neutral-800 mb-4 text-center">Employee Profile Details</h2>
                            <div className="mb-4">
                                <label htmlFor="edit_name" className="block text-neutral-700 text-sm font-bold mb-2">Full Name:</label>
                                <input type="text" id="edit_name" name="name" value={currentEmployeeToEdit.name || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_cnic" className="block text-neutral-700 text-sm font-bold mb-2">CNIC:</label>
                                <input type="text" id="edit_cnic" name="cnic" value={currentEmployeeToEdit.cnic || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_phone_number" className="block text-neutral-700 text-sm font-bold mb-2">Phone Number:</label>
                                <input type="text" id="edit_phone_number" name="phone_number" value={currentEmployeeToEdit.phone_number || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_address" className="block text-neutral-700 text-sm font-bold mb-2">Address:</label>
                                <input type="text" id="edit_address" name="address" value={currentEmployeeToEdit.address || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_Job_title" className="block text-neutral-700 text-sm font-bold mb-2">Job Title:</label>
                                <input type="text" id="edit_Job_title" name="Job_title" value={currentEmployeeToEdit.Job_title || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_employee_id" className="block text-neutral-700 text-sm font-bold mb-2">Employee ID:</label>
                                <input type="text" id="edit_employee_id" name="employee_id" value={currentEmployeeToEdit.employee_id || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_joining_date" className="block text-neutral-700 text-sm font-bold mb-2">Joining Date:</label>
                                <input type="date" id="edit_joining_date" name="joining_date" value={currentEmployeeToEdit.joining_date || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="edit_image" className="block text-neutral-700 text-sm font-bold mb-2">Profile Image:</label>
                                <input type="file" id="edit_image" name="image" onChange={handleEditEmployeeFileChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                {currentEmployeeToEdit.photo && typeof currentEmployeeToEdit.photo === 'string' && (
                                    <p className="text-sm text-neutral-500 mt-1">Current image: <a href={currentEmployeeToEdit.photo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
                                )}
                            </div>

                            <h2 className="text-lg font-semibold text-neutral-800 mb-4 mt-6">User Account Details (Optional)</h2>
                            <div className="mb-4">
                                <label htmlFor="edit_username" className="block text-neutral-700 text-sm font-bold mb-2">Username:</label>
                                <input type="text" id="edit_username" name="username" value={currentEmployeeToEdit.username || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_email" className="block text-neutral-700 text-sm font-bold mb-2">Email:</label>
                                <input type="email" id="edit_email" name="email" value={currentEmployeeToEdit.email || ''} onChange={handleEditEmployeeInputChange} required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_first_name" className="block text-neutral-700 text-sm font-bold mb-2">First Name:</label>
                                <input type="text" id="edit_first_name" name="first_name" value={currentEmployeeToEdit.first_name || ''} onChange={handleEditEmployeeInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit_last_name" className="block text-neutral-700 text-sm font-bold mb-2">Last Name:</label>
                                <input type="text" id="edit_last_name" name="last_name" value={currentEmployeeToEdit.last_name || ''} onChange={handleEditEmployeeInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"/>
                            </div>
                            {/* Do NOT include a password field here unless you have a separate, secure flow for password changes */}
                            {/* <div className="mb-6">
                                <label htmlFor="edit_password" className="block text-neutral-700 text-sm font-bold mb-2">New Password (optional):</label>
                                <input type="password" id="edit_password" name="password" value={currentEmployeeToEdit.password} onChange={handleEditEmployeeInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"/>
                                <p className="text-sm text-neutral-500">Leave blank to keep current password.</p>
                            </div> */}

                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline">
                                Update Employee
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Employee Documents View (Slides in) */}
            {employeeForDocuments && (
                <div
                    className={`fixed inset-0 bg-neutral-50 z-20 flex flex-col font-sans
                                transition-transform duration-300 ease-out
                                ${showDocuments ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <EmployeeDocuments
                        employeeId={employeeForDocuments.id}
                        employeeName={employeeForDocuments.name}
                        onBack={handleBackFromDocuments}
                    />
                </div>
            )}

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