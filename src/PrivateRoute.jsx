import React from "react";
import { Navigate } from "react-router-dom";

export function PrivateRoute({ children, allowedId, user }) {
  console.log("PrivateRoute Check - User ID:", user?.id);
  console.log("PrivateRoute - allowedId:", allowedId);

  // If no user is logged in, redirect to login
  if (!user || typeof user.id === "undefined") {
    return <Navigate to="/login" replace />;
  }

  // Check if user id matches the allowedId logic:
  // If allowedId is admin (8), user must be admin (id=8)
  // If allowedId is not admin (like 0), user must NOT be admin (id !== 8)
  const isAdminAllowed = allowedId === 18;
  const isUserAdmin = user.id === 18;

  if ((isAdminAllowed && !isUserAdmin) || (!isAdminAllowed && isUserAdmin)) {
    return <Navigate to="/login" replace />;
  }

  // If all check passes, render the children
  return children;
}
