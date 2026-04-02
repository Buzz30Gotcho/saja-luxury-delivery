import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const resolveUserRole = (user) => {
  if (!user) return null;
  // On ne prend en compte QUE le rôle du profil (table profiles)
  return user?.profile?.role || null;
};

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (role) {
    const currentRole = resolveUserRole(user);
    if (currentRole !== role) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
