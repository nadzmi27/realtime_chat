import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user } = UserAuth();
  if (user === undefined) {
    // session is still loading; don't redirect yet
    return <div>Loading...</div>;
  }
  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
