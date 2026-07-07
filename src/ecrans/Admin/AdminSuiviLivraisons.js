import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const STATUT_LABELS = { assignee: 'Attribuée', en_cours: 'En cours', livree: 'Livrée' };
const STATUT_COLORS = {
  assignee: 'bg-orange-500/20 text-orange-300',
  en_cours: 'bg-blue-500/20 text-blue-300',
  livree: 'bg-green-500/20 text-green-300'
};

const AdminSuiviLivraisons = () => {
  const { showToast } = useToast();
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/livraisons')
      .then(setLivraisons)
      .catch(() => showToast('Erreur lors du chargement des livraisons', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white mb-6">Suivi des livraisons</h1>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-white/70 text-sm">
            <tr>
              <th className="p-4">Référence</th>
              <th className="p-4">Client</th>
              <th className="p-4">Livreur</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Attribuée le</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">Chargement...</td>
              </tr>
            ) : livraisons.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">Aucune livraison pour le moment.</td>
              </tr>
            ) : (
              livraisons.map((livraison) => (
                <tr key={livraison.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{livraison.reference}</td>
                  <td className="p-4 text-white/70">{livraison.client_username}</td>
                  <td className="p-4 text-white/70">{livraison.livreur_username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs ${STATUT_COLORS[livraison.statut] || 'bg-white/10 text-white/60'}`}>
                      {STATUT_LABELS[livraison.statut] || livraison.statut}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm">
                    {new Date(livraison.date_assignation).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSuiviLivraisons;
