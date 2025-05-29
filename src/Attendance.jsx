import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/users");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const markAttendance = async (employeeId) => {
    try {
      await axios.post("https://jsonplaceholder.typicode.com/posts", {
        employeeId,
        date: selectedDate,
        status: "Present",
      });

      setAttendanceRecords((prev) => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [employeeId]: "Present",
        },
      }));

      setAttendanceStatus((prev) => ({
        ...prev,
        [employeeId]: true, // Disables button after marking attendance
      }));
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  const openHistoryModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setShowModal(false);
  };

  // Calculate attendance ratio
  const totalEmployees = employees.length;
  const totalPresent = Object.values(attendanceRecords[selectedDate] || {}).filter(status => status === "Present").length;
  const totalAbsent = totalEmployees - totalPresent;

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg relative">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">HR Employee Dashboard</h2>

      {/* Attendance Ratio Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Total Employees</h3>
          <p className="text-xl font-bold">{totalEmployees}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Present</h3>
          <p className="text-xl font-bold">{totalPresent}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Absent</h3>
          <p className="text-xl font-bold">{totalAbsent}</p>
        </div>
      </div>

      {/* Attendance Marking */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr className="text-sm md:text-lg">
              <th className="px-4 py-3 text-left font-semibold">Employee Name</th>
              <th className="px-4 py-3 text-center font-semibold">Mark Attendance</th>
              <th className="px-4 py-3 text-center font-semibold">View History</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b">
                <td className="px-4 py-4 text-gray-700">{emp.name}</td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => markAttendance(emp.id)}
                    disabled={attendanceStatus[emp.id]}
                    className={`px-3 py-2 rounded-lg shadow-md transition duration-300 ${
                      attendanceStatus[emp.id]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {attendanceStatus[emp.id] ? "Marked" : "Mark Present"}
                  </button>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => openHistoryModal(emp)}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attendance History Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance History: {selectedEmployee.name}</h3>
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(attendanceRecords).map(([date, records]) => (
                  <tr key={date} className="border-b">
                    <td className="px-4 py-4 text-gray-700">{date}</td>
                    <td className="px-4 py-4 text-center font-semibold text-blue-600">
                      {records[selectedEmployee.id] || "Not Marked"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
