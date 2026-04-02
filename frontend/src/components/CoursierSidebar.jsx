import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/coursier/dashboard", label: "Tableau de bord" },
  { to: "/coursier/historique", label: "Historique" },
];

export default function CoursierSidebar() {
  const location = useLocation();
  return (
    <nav className="flex flex-col gap-2 p-4 bg-white border-r border-slate-100 min-h-screen w-56">
      <div className="mb-8 text-xl font-bold text-blue-700">Espace Coursier</div>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            location.pathname === link.to
              ? "bg-blue-50 text-blue-700"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
