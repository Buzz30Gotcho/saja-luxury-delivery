import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRouteCoursier = ({ children }) => {
  const { user, loading } = useAuth();

  // Si on est en train de charger, on attend
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl">
      Chargement de l'espace coursier...
    </div>
  );

  if (!user) {
    return <Navigate to="/coursier/login" replace />;
  }
// LOGIQUE ULTRA-SOUPLE : Si l'utilisateur est authentifié, on le laisse passer par défaut.
// On ne le rejette QUE si on est absolument sûr qu'il a un autre rôle (ex: customer)
const isExplicitlyDenied = user && (
  (user.role === 'customer' || user.user_metadata?.role === 'customer') &&
  !(user.profile?.role === 'delivery_person' || user.user_metadata?.role === 'delivery_person')
);

if (isExplicitlyDenied) {
  console.warn('[ProtectedRouteCoursier] Accès refusé : Rôle client détecté.');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-red-600 text-xl p-4 text-center">
...
        <p>⛔ Accès refusé : vous n'êtes pas autorisé à accéder à l'espace coursier.</p>
        <p className="mt-2 text-base text-gray-500">
          Votre rôle actuel : <b>{user?.user_metadata?.role || user?.role || 'Inconnu'}</b>
        </p>
        <p className="text-sm text-gray-400">(Rôle requis : delivery_person)</p>
        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          onClick={() => window.location.href = '/coursier/login'}
        >
          Réessayer la connexion
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRouteCoursier;
