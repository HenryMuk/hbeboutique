import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const AdminSignalements = () => {
  const { showToast } = useToast();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    apiFetch('/admin/signalements')
      .then(setSignalements)
      .catch(() => showToast('Erreur lors du chargement des signalements', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = async (id) => {
    try {
      await apiFetch(`/admin/signalements/${id}`, { method: 'DELETE' });
      showToast('Signalement traité');
      charger();
    } catch (err) {
      showToast('Erreur lors du traitement', 'error');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white mb-6">Signalements</h1>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-white/70 text-sm">
            <tr>
              <th className="p-4">Produit</th>
              <th className="p-4">Motif</th>
              <th className="p-4">Signalé par</th>
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
            ) : signalements.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">
                  Aucun signalement pour le moment.
                </td>
              </tr>
            ) : (
              signalements.map((signalement) => (
                <tr key={signalement.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{signalement.produit_nom}</td>
                  <td className="p-4 text-white/70 max-w-xs">{signalement.motif}</td>
                  <td className="p-4 text-white/70">
                    {signalement.username}
                    <div className="text-xs text-white/40">{signalement.email}</div>
                  </td>
                  <td className="p-4 text-white/50 text-sm">
                    {new Date(signalement.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDismiss(signalement.id)}
                      className="text-green-300 hover:text-green-200 transition"
                    >
                      Marquer traité
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

export default AdminSignalements;
