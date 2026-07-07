import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles';

const linkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-xl transition ${
    isActive ? 'bg-purple-500/30 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
  }`;

const NAV_ITEMS = [
  { to: '/admin/produits', label: 'Produits', roles: [ROLES.GESTIONNAIRE_BOUTIQUE] },
  { to: '/admin/signalements', label: 'Signalements', roles: [ROLES.GESTIONNAIRE_BOUTIQUE] },
  { to: '/admin/utilisateurs', label: 'Utilisateurs & rôles', roles: [ROLES.ADMIN] }
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const items = NAV_ITEMS.filter((item) => role === ROLES.ADMIN || item.roles.includes(role));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 space-y-2 shrink-0">
        <h2 className="text-white font-bold text-xl mb-6">Espace pro</h2>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
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
