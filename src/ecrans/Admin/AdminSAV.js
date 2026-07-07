import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const STATUT_LABELS = { ouvert: 'Ouverte', en_cours: 'En cours', resolu: 'Résolue' };
const STATUT_COLORS = {
  ouvert: 'bg-orange-500/20 text-orange-300',
  en_cours: 'bg-blue-500/20 text-blue-300',
  resolu: 'bg-green-500/20 text-green-300'
};
const LIVRAISON_LABELS = { assignee: 'Attribuée', en_cours: 'En cours', livree: 'Livrée' };

const AdminSAV = () => {
  const { showToast } = useToast();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ouvertId, setOuvertId] = useState(null);
  const [resolution, setResolution] = useState('');
  const [actionEnCours, setActionEnCours] = useState(null);

  const charger = () => {
    setLoading(true);
    apiFetch('/admin/sav')
      .then(setReclamations)
      .catch(() => showToast('Erreur lors du chargement des réclamations', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ouvrirDetail = (r) => {
    setOuvertId(ouvertId === r.id ? null : r.id);
    setResolution(r.resolution || '');
  };

  const traiter = async (id, statut) => {
    setActionEnCours(id);
    try {
      await apiFetch(`/admin/sav/${id}`, { method: 'PATCH', body: { statut, resolution } });
      showToast('Réclamation mise à jour');
      setOuvertId(null);
      charger();
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setActionEnCours(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white mb-6">Réclamations SAV</h1>

      {loading ? (
        <p className="text-white/50">Chargement...</p>
      ) : reclamations.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center text-white/50">
          Aucune réclamation pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {reclamations.map((r) => (
            <div key={r.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => ouvrirDetail(r)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition"
              >
                <div>
                  <p className="text-white font-semibold">{r.reference}</p>
                  <p className="text-white/50 text-sm">
                    {r.username} — {r.email}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${STATUT_COLORS[r.statut]}`}>
                  {STATUT_LABELS[r.statut] || r.statut}
                </span>
              </button>

              {ouvertId === r.id && (
                <div className="p-5 border-t border-white/10 space-y-4 animate-scale-in">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Motif du client</p>
                    <p className="text-white/80">{r.motif}</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Détails de la livraison</p>
                    {r.livraison_statut ? (
                      <div className="text-sm text-white/70 space-y-1">
                        <p>Livreur : {r.livreur_username || 'N/A'}</p>
                        <p>Statut de livraison : {LIVRAISON_LABELS[r.livraison_statut] || r.livraison_statut}</p>
                        {r.date_assignation && (
                          <p>Attribuée le : {new Date(r.date_assignation).toLocaleString('fr-FR')}</p>
                        )}
                        {r.date_livraison && (
                          <p>Livrée le : {new Date(r.date_livraison).toLocaleString('fr-FR')}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm">Aucune information de livraison disponible.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Réponse / résolution</label>
                    <textarea
                      rows={3}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Expliquez la résolution apportée..."
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                    />
                  </div>

                  <div className="flex gap-3">
                    {r.statut !== 'en_cours' && (
                      <button
                        onClick={() => traiter(r.id, 'en_cours')}
                        disabled={actionEnCours === r.id}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition disabled:opacity-50"
                      >
                        Marquer en cours
                      </button>
                    )}
                    {r.statut !== 'resolu' && (
                      <button
                        onClick={() => traiter(r.id, 'resolu')}
                        disabled={actionEnCours === r.id}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl transition disabled:opacity-50"
                      >
                        Marquer résolue
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSAV;
