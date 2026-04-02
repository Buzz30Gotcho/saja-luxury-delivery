import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRouteMerchant = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl">
      Chargement de l'espace marchand...
    </div>
  );

  // Vérifie si l'utilisateur est connecté ET s'il a le rôle de propriétaire de boutique
  if (!user || (user.role !== 'shop_owner' && user.profile?.role !== 'shop_owner')) {
    return <Navigate to="/merchant/login" replace />;
  }

  return children;
};

export default ProtectedRouteMerchant;
