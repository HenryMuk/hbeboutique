import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { SkeletonLine } from '../../components/SkeletonCard';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';
import { ROLE_LABELS } from '../../constants/roles';

const MonProfil = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/utilisateur/moi')
      .then(setProfil)
      .catch(() => showToast('Erreur lors du chargement du profil', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <button onClick={() => navigate('/accueil')} className="text-purple-300 hover:text-purple-200 mb-6">
          &larr; Retour au catalogue
        </button>
        <h1 className="text-3xl font-bold text-white mb-8 animate-fade-in-up">Mon profil</h1>

        {loading ? (
          <SkeletonLine className="h-40 w-full" />
        ) : profil ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{profil.username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white text-xl font-semibold">{profil.username}</p>
                <p className="text-white/50 text-sm">{profil.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Rôle</p>
                <p className="text-white">{ROLE_LABELS[profil.role] || profil.role}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">État du compte</p>
                <p className="text-white">{profil.etat}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Email vérifié</p>
                <p className="text-white">{profil.email_verifie ? 'Oui' : 'Non'}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Membre depuis</p>
                <p className="text-white">{new Date(profil.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white/60">Impossible de charger votre profil.</p>
        )}
      </div>
    </div>
  );
};

export default MonProfil;
