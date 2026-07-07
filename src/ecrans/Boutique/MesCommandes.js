import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { SkeletonLine } from '../../components/SkeletonCard';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const STATUT_LABELS = {
  en_attente_paiement: 'Paiement en cours',
  en_attente_validation: 'En attente de validation',
  validee: 'Validée',
  rejetee: 'Refusée',
  expediee: 'Expédiée',
  livree: 'Livrée'
};

const STATUT_COLORS = {
  en_attente_paiement: 'bg-white/10 text-white/60',
  en_attente_validation: 'bg-orange-500/20 text-orange-300',
  validee: 'bg-green-500/20 text-green-300',
  rejetee: 'bg-red-500/20 text-red-300',
  expediee: 'bg-blue-500/20 text-blue-300',
  livree: 'bg-green-500/20 text-green-300'
};

const MesCommandes = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    apiFetch('/commandes/mes-commandes')
      .then(setCommandes)
      .catch(() => showToast('Erreur lors du chargement de vos commandes', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const telechargerFacture = (commandeId) => {
    const token = localStorage.getItem('userToken');
    window.open(`${process.env.REACT_APP_API_URL}/commandes/${commandeId}/facture?token=${token}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <button onClick={() => navigate('/accueil')} className="text-purple-300 hover:text-purple-200 mb-6">
          &larr; Retour au catalogue
        </button>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white animate-fade-in-up">Mes commandes</h1>
          <button
            onClick={() => navigate('/mes-reclamations')}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
          >
            Mes réclamations
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonLine className="h-20 w-full" />
            <SkeletonLine className="h-20 w-full" />
          </div>
        ) : commandes.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center animate-fade-in-up">
            <p className="text-white/60">Vous n'avez pas encore passé de commande.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commandes.map((commande, index) => (
              <div
                key={commande.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex items-center justify-between gap-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div>
                  <p className="text-white font-semibold">{commande.reference}</p>
                  <p className="text-white/50 text-sm">{new Date(commande.created_at).toLocaleString('fr-FR')}</p>
                  <p className="text-purple-300 font-bold mt-1">
                    {Number(commande.montant_total).toLocaleString('fr-FR')} CDF
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${STATUT_COLORS[commande.statut] || 'bg-white/10 text-white/60'}`}>
                    {STATUT_LABELS[commande.statut] || commande.statut}
                  </span>
                  {commande.facture_id && (
                    <button
                      onClick={() => telechargerFacture(commande.id)}
                      className="px-3 py-1.5 text-sm bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 rounded-lg transition"
                    >
                      Facture
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesCommandes;
