import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { SkeletonLine } from '../../components/SkeletonCard';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const STATUT_LABELS = { ouvert: 'Ouverte', en_cours: 'En cours de traitement', resolu: 'Résolue' };
const STATUT_COLORS = {
  ouvert: 'bg-orange-500/20 text-orange-300',
  en_cours: 'bg-blue-500/20 text-blue-300',
  resolu: 'bg-green-500/20 text-green-300'
};

const MesReclamations = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [reclamations, setReclamations] = useState([]);
  const [commandesLivrees, setCommandesLivrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [commandeId, setCommandeId] = useState('');
  const [motif, setMotif] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = () => {
    setLoading(true);
    Promise.all([apiFetch('/sav/mes-reclamations'), apiFetch('/commandes/mes-commandes')])
      .then(([reclams, commandes]) => {
        setReclamations(reclams);
        const idsAvecReclamation = new Set(reclams.map((r) => r.commande_id));
        setCommandesLivrees(commandes.filter((c) => c.statut === 'livree' && !idsAvecReclamation.has(c.id)));
      })
      .catch(() => showToast('Erreur lors du chargement', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commandeId || !motif.trim()) {
      showToast('Sélectionnez une commande et décrivez le problème', 'error');
      return;
    }
    setEnvoiEnCours(true);
    try {
      await apiFetch('/sav', { method: 'POST', body: { commandeId, motif } });
      showToast('Réclamation envoyée');
      setFormOuvert(false);
      setCommandeId('');
      setMotif('');
      charger();
    } catch (err) {
      showToast("Erreur lors de l'envoi de la réclamation", 'error');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <button onClick={() => navigate('/mes-commandes')} className="text-purple-300 hover:text-purple-200 mb-6">
          &larr; Retour à mes commandes
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white animate-fade-in-up">Mes réclamations</h1>
          {commandesLivrees.length > 0 && (
            <button
              onClick={() => setFormOuvert((v) => !v)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
            >
              + Nouvelle réclamation
            </button>
          )}
        </div>

        {formOuvert && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 space-y-4 animate-scale-in"
          >
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Commande concernée</label>
              <select
                value={commandeId}
                onChange={(e) => setCommandeId(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
              >
                <option value="" className="bg-slate-800">Choisir une commande livrée</option>
                {commandesLivrees.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-800">
                    {c.reference} — {Number(c.montant_total).toLocaleString('fr-FR')} CDF
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Décrivez le problème rencontré..."
              rows={4}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
            />
            <button
              type="submit"
              disabled={envoiEnCours}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition disabled:opacity-50"
            >
              {envoiEnCours ? 'Envoi...' : 'Envoyer la réclamation'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-4">
            <SkeletonLine className="h-20 w-full" />
            <SkeletonLine className="h-20 w-full" />
          </div>
        ) : reclamations.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center animate-fade-in-up">
            <p className="text-white/60">Vous n'avez pas encore fait de réclamation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reclamations.map((r, index) => (
              <div
                key={r.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold">{r.reference}</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${STATUT_COLORS[r.statut]}`}>
                    {STATUT_LABELS[r.statut] || r.statut}
                  </span>
                </div>
                <p className="text-white/70 text-sm mb-2">{r.motif}</p>
                {r.resolution && (
                  <p className="text-green-300 text-sm bg-green-500/10 rounded-lg p-3">
                    Réponse : {r.resolution}
                  </p>
                )}
                <p className="text-white/40 text-xs mt-2">{new Date(r.created_at).toLocaleString('fr-FR')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesReclamations;
