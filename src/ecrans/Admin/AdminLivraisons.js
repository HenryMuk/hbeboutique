import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const STATUT_LABELS = { assignee: 'À récupérer', en_cours: 'En cours de livraison', livree: 'Livrée' };
const STATUT_COLORS = {
  assignee: 'bg-orange-500/20 text-orange-300',
  en_cours: 'bg-blue-500/20 text-blue-300',
  livree: 'bg-green-500/20 text-green-300'
};

const AdminLivraisons = () => {
  const { showToast } = useToast();
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);

  const charger = () => {
    setLoading(true);
    apiFetch('/admin/livraisons/mes-livraisons')
      .then(setLivraisons)
      .catch(() => showToast('Erreur lors du chargement', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const marquerEnCours = async (id) => {
    setActionEnCours(id);
    try {
      await apiFetch(`/admin/livraisons/${id}/en-cours`, { method: 'PATCH' });
      showToast('Livraison en cours');
      charger();
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setActionEnCours(null);
    }
  };

  const marquerLivree = async (id) => {
    setActionEnCours(id);
    try {
      await apiFetch(`/admin/livraisons/${id}/livree`, { method: 'PATCH' });
      showToast('Livraison marquée comme livrée');
      charger();
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setActionEnCours(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white mb-6">Mes livraisons</h1>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-white/70 text-sm">
            <tr>
              <th className="p-4">Référence</th>
              <th className="p-4">Client</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">Chargement...</td>
              </tr>
            ) : livraisons.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">Aucune livraison qui vous est attribuée.</td>
              </tr>
            ) : (
              livraisons.map((livraison) => (
                <tr key={livraison.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{livraison.reference}</td>
                  <td className="p-4 text-white/70">{livraison.client_username}</td>
                  <td className="p-4 text-white/70">{livraison.telephone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs ${STATUT_COLORS[livraison.statut] || 'bg-white/10 text-white/60'}`}>
                      {STATUT_LABELS[livraison.statut] || livraison.statut}
                    </span>
                  </td>
                  <td className="p-4 space-x-3 whitespace-nowrap">
                    {livraison.statut === 'assignee' && (
                      <button
                        onClick={() => marquerEnCours(livraison.id)}
                        disabled={actionEnCours === livraison.id}
                        className="text-blue-300 hover:text-blue-200 transition disabled:opacity-50"
                      >
                        Marquer en cours
                      </button>
                    )}
                    {livraison.statut !== 'livree' && (
                      <button
                        onClick={() => marquerLivree(livraison.id)}
                        disabled={actionEnCours === livraison.id}
                        className="text-green-300 hover:text-green-200 transition disabled:opacity-50"
                      >
                        Marquer livrée
                      </button>
                    )}
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

export default AdminLivraisons;
