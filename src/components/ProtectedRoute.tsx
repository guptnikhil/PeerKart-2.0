import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ADMIN_USER_ID = "e2d9aa8d-3be5-45b4-917d-7a72f9416513"; // Replace with your actual admin user ID

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.id !== ADMIN_USER_ID) {
    return <Navigate to="/" replace />; // Redirect non-admin users from admin-only routes
  }

  return <>{children}</>;
};

export default ProtectedRoute;