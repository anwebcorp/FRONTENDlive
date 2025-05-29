// App.js
import React, { useState, useEffect } from "react"; // Import useEffect
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Admin from "./Admin";
import Employee from "./Employee";
import { PrivateRoute } from "./PrivateRoute"; // Assuming PrivateRoute is in its own file

function App() {
  const [user, setUser] = useState(null); // Initial user state is null

  // --- ADD THIS useEffect BLOCK ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken'); 

    if (storedUser && accessToken) { // Only attempt to parse if both exist
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("App.js: User rehydrated from localStorage:", parsedUser);
      } catch (e) {
        console.error("App.js: Failed to parse user from localStorage", e);
        // Clear all potentially bad auth data if parsing fails
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null); 
      }
    } else {
        console.log("App.js: No user or accessToken in localStorage on app load.");
        setUser(null); 
    }
  }, []); // Empty dependency array means this runs only once on mount
  // --- END useEffect BLOCK ---

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedId={18} user={user}> {/* Pass user state */}
              <Admin user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <PrivateRoute allowedId={0} user={user}> {/* Pass user state */}
              <Employee user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
        {/* Fallback for any unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} /> 
      </Routes>
    </Router>
  );
}

export default App;