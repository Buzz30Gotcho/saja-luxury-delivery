
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CoursierSidebar from "./CoursierSidebar";

const CoursierLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // On ne met PLUS de header ici car le Dashboard a le sien qui est plus moderne
  // Ce layout sert maintenant juste de conteneur structurel
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <main className="w-full flex-1">
          <Outlet />
        </main>
        {/* Footer discret */}
        <footer className="py-8 text-center text-slate-400 text-xs font-medium tracking-widest uppercase">
          &copy; 2026 SAJA Delivery &bull; Espace Pro
        </footer>
      </div>
    );
};

export default CoursierLayout;
