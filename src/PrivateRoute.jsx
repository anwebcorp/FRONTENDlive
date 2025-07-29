import React from "react";
import { Navigate } from "react-router-dom";

export function PrivateRoute({ children, allowedId, user }) {
  console.log("PrivateRoute Check - User ID:", user?.id);
  console.log("PrivateRoute - allowedId:", allowedId); // This is still your conceptual route ID (e.g., 18 for admin route)
  console.log("PrivateRoute - user.isAdmin:", user?.isAdmin); // Check the isAdmin flag from the user object

  // If no user is logged in, redirect to login
  if (!user || typeof user.id === "undefined") {
    return <Navigate to="/login" replace />;
  }

  // Determine if the current route is intended for administrators (based on allowedId)
  const isRouteForAdmin = allowedId === 18; // Assuming 18 means this route is for admins

  // Determine if the logged-in user IS an administrator (based on the isAdmin flag from Login.jsx)
  const isUserActuallyAdmin = user.isAdmin === true;

  // Authorization Logic:

  // Scenario 1: The route is meant for admins (isRouteForAdmin is true)
  // AND the logged-in user is NOT an admin (isUserActuallyAdmin is false)
  if (isRouteForAdmin && !isUserActuallyAdmin) {
    console.warn("Redirecting: Route requires admin access, but logged-in user is not an admin.");
    return <Navigate to="/login" replace />;
  }

  // Scenario 2: The route is NOT meant for admins (isRouteForAdmin is false, e.g., an employee route)
  // AND the logged-in user IS an admin (isUserActuallyAdmin is true)
  // This prevents admins from accessing regular employee pages if your policy dictates.
  if (!isRouteForAdmin && isUserActuallyAdmin) {
    console.warn("Redirecting: Route is not for admin access, but logged-in user IS an admin.");
    // You might want to navigate to a different route for admins, e.g., '/admin-dashboard'
    // return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />; // Redirect to login as per your original logic
  }

  // If all checks pass (user is logged in, and their role matches the route's requirement), render the children
  return children;
}