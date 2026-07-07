import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const AdminPaiements = () => {
  const { showToast } = useToast();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/paiements')
      .then(setPaiements)
      .catch(() => showToast('Erreur lors du chargement des paiements', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const telechargerFacture = (commandeId) => {
    const token = localStorage.getItem('userToken');
    window.open(`${process.env.REACT_APP_API_URL}/commandes/${commandeId}/facture?token=${token}`, '_blank');
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white mb-6">Historique des paiements</h1>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-white/70 text-sm">
            <tr>
              <th className="p-4">Référence</th>
              <th className="p-4">Client</th>
              <th className="p-4">Montant</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4">Facture</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-white/50">
                  Chargement...
                </td>
              </tr>
            ) : paiements.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-white/50">
                  Aucun paiement pour le moment.
                </td>
              </tr>
            ) : (
              paiements.map((paiement) => (
                <tr key={paiement.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{paiement.reference}</td>
                  <td className="p-4 text-white/70">
                    {paiement.username}
                    <div className="text-xs text-white/40">{paiement.email}</div>
                  </td>
                  <td className="p-4 text-purple-300 font-semibold">
                    {Number(paiement.montant_total).toLocaleString('fr-FR')} CDF
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        paiement.statut === 'validee' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {paiement.statut === 'validee' ? 'Validée' : 'Refusée'}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm">
                    {new Date(paiement.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="p-4">
                    {paiement.facture_id ? (
                      <button
                        onClick={() => telechargerFacture(paiement.id)}
                        className="text-purple-300 hover:text-purple-200 transition"
                      >
                        Télécharger
                      </button>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
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

export default AdminPaiements;
