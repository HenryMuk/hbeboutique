import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-xl transition ${
    isActive ? 'bg-purple-500/30 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 space-y-2 shrink-0">
        <h2 className="text-white font-bold text-xl mb-6">Administration</h2>
        <NavLink to="/admin/produits" className={linkClass}>
          Produits
        </NavLink>
        <NavLink to="/admin/utilisateurs" className={linkClass}>
          Utilisateurs
        </NavLink>
        <NavLink to="/admin/signalements" className={linkClass}>
          Signalements
        </NavLink>
        <button
          onClick={() => navigate('/accueil')}
          className="block w-full text-left px-4 py-3 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition mt-8"
        >
          &larr; Retour à la boutique
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
