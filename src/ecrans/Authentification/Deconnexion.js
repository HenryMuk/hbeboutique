import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Deconnexion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || { username: 'Utilisateur' };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    navigate('/connexion');
  };

  // Cartes vides
  const emptyCards = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl">HBE Boutique</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* User Menu & Deconnexion */}
            <div className="flex items-center space-x-4">
              <button className="relative">
                <svg className="w-6 h-6 text-white/80 hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-white/80 hidden md:block">
                  <span className="text-purple-300 font-medium">{username}</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition border border-red-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenue chez <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">HBE Boutique</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Découvrez notre sélection de produits premium au meilleur prix
          </p>
        </div>
      </div>

      {/* Products Grid - Cartes vides */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {emptyCards.map((item) => (
            <div
              key={item}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
            >
              <div className="h-48 bg-white/5"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
                <div className="h-4 bg-white/10 rounded-lg w-1/2"></div>
                <div className="h-10 bg-white/10 rounded-xl w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Deconnexion;