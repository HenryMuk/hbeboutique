import React, { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const AdminCommandesValidation = () => {
  const { showToast } = useToast();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);

  const charger = () => {
    setLoading(true);
    apiFetch('/admin/commandes')
      .then(setCommandes)
      .catch(() => showToast('Erreur lors du chargement des commandes', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valider = async (id) => {
    setActionEnCours(id);
    try {
      await apiFetch(`/admin/commandes/${id}/valider`, { method: 'PATCH' });
      showToast('Commande validée, facture générée');
      charger();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'STOCK_INSUFFISANT') {
        showToast('Stock insuffisant pour valider cette commande — vous devez la rejeter', 'error');
      } else {
        showToast('Erreur lors de la validation', 'error');
      }
    } finally {
      setActionEnCours(null);
    }
  };

  const rejeter = async (id) => {
    if (!window.confirm('Rejeter cette commande ?')) return;
    setActionEnCours(id);
    try {
      await apiFetch(`/admin/commandes/${id}/rejeter`, { method: 'PATCH' });
      showToast('Commande rejetée');
      charger();
    } catch (err) {
      showToast('Erreur lors du rejet', 'error');
    } finally {
      setActionEnCours(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white mb-6">Commandes à valider</h1>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-white/70 text-sm">
            <tr>
              <th className="p-4">Référence</th>
              <th className="p-4">Client</th>
              <th className="p-4">Montant</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">
                  Chargement...
                </td>
              </tr>
            ) : commandes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">
                  Aucune commande en attente de validation.
                </td>
              </tr>
            ) : (
              commandes.map((commande) => (
                <tr key={commande.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{commande.reference}</td>
                  <td className="p-4 text-white/70">
                    {commande.username}
                    <div className="text-xs text-white/40">{commande.email}</div>
                  </td>
                  <td className="p-4 text-purple-300 font-semibold">
                    {Number(commande.montant_total).toLocaleString('fr-FR')} CDF
                  </td>
                  <td className="p-4 text-white/50 text-sm">
                    {new Date(commande.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="p-4 space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => valider(commande.id)}
                      disabled={actionEnCours === commande.id}
                      className="text-green-300 hover:text-green-200 transition disabled:opacity-50"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => rejeter(commande.id)}
                      disabled={actionEnCours === commande.id}
                      className="text-red-300 hover:text-red-200 transition disabled:opacity-50"
                    >
                      Rejeter
                    </button>
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

export default AdminCommandesValidation;
