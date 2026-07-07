import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const STATUT_LABELS = { assignee: 'Attribuée', en_cours: 'En cours', livree: 'Livrée' };

const AdminEntrepot = () => {
  const { showToast } = useToast();
  const [commandes, setCommandes] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [selection, setSelection] = useState({});
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/admin/livraisons/a-expedier'),
      apiFetch('/admin/livraisons/livreurs'),
      apiFetch('/admin/livraisons')
    ])
      .then(([c, l, all]) => {
        setCommandes(c);
        setLivreurs(l);
        setLivraisons(all);
      })
      .catch(() => showToast('Erreur lors du chargement', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attribuer = async (commandeId) => {
    const livreurId = selection[commandeId];
    if (!livreurId) {
      showToast('Sélectionnez un livreur', 'error');
      return;
    }
    try {
      await apiFetch('/admin/livraisons', { method: 'POST', body: { commandeId, livreurId } });
      showToast('Livreur attribué');
      charger();
    } catch (err) {
      showToast("Erreur lors de l'attribution", 'error');
    }
  };

  return (
    <div className="animate-fade-in-up space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Commandes à expédier</h1>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/10 text-white/70 text-sm">
              <tr>
                <th className="p-4">Référence</th>
                <th className="p-4">Client</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Livreur</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-white/50">Chargement...</td>
                </tr>
              ) : commandes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-white/50">Aucune commande à expédier.</td>
                </tr>
              ) : (
                commandes.map((commande) => (
                  <tr key={commande.id} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-4 text-white">{commande.reference}</td>
                    <td className="p-4 text-white/70">{commande.username}</td>
                    <td className="p-4 text-purple-300 font-semibold">
                      {Number(commande.montant_total).toLocaleString('fr-FR')} CDF
                    </td>
                    <td className="p-4">
                      <select
                        value={selection[commande.id] || ''}
                        onChange={(e) => setSelection({ ...selection, [commande.id]: e.target.value })}
                        className="px-2 py-1.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white"
                      >
                        <option value="" className="bg-slate-800">Choisir un livreur</option>
                        {livreurs.map((l) => (
                          <option key={l.id} value={l.id} className="bg-slate-800">
                            {l.username}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => attribuer(commande.id)}
                        className="text-green-300 hover:text-green-200 transition"
                      >
                        Attribuer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Suivi des livraisons</h2>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/10 text-white/70 text-sm">
              <tr>
                <th className="p-4">Référence</th>
                <th className="p-4">Client</th>
                <th className="p-4">Livreur</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {livraisons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-white/50">Aucune livraison en cours.</td>
                </tr>
              ) : (
                livraisons.map((livraison) => (
                  <tr key={livraison.id} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-4 text-white">{livraison.reference}</td>
                    <td className="p-4 text-white/70">{livraison.client_username}</td>
                    <td className="p-4 text-white/70">{livraison.livreur_username}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300">
                        {STATUT_LABELS[livraison.statut] || livraison.statut}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEntrepot;
