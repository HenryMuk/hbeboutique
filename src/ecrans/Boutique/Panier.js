import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { SkeletonLine } from '../../components/SkeletonCard';
import { usePanier } from '../../contexts/PanierContext';
import { useToast } from '../../contexts/ToastContext';
import { apiFetch } from '../../api/client';
import { resolveImageUrl } from '../../utils/media';

const STATUT_LABELS = {
  en_attente: 'Confirmation de la commande en cours...',
  reussie: 'Commande confirmée ! Merci pour votre achat.',
  echouee: 'La commande a échoué. Vous pouvez réessayer.'
};

const Panier = () => {
  const navigate = useNavigate();
  const { items, total, updateQuantite, removeItem, refresh } = usePanier();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [telephone, setTelephone] = useState('');
  const [commande, setCommande] = useState(null);
  const [statut, setStatut] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!commande) return undefined;

    const token = localStorage.getItem('userToken');
    const source = new EventSource(
      `${process.env.REACT_APP_API_URL}/commandes/${commande.commandeId}/statut/stream?token=${token}`
    );

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatut(data.statut);
      if (data.statut !== 'en_attente') {
        source.close();
        if (data.statut === 'reussie') {
          refresh();
        }
      }
    };

    source.onerror = () => source.close();

    return () => source.close();
  }, [commande, refresh]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (!telephone) {
      setError('Veuillez entrer un numéro de téléphone');
      return;
    }

    setEnvoiEnCours(true);
    try {
      const result = await apiFetch('/panier/checkout', { method: 'POST', body: { telephone } });
      setCommande(result);
      setStatut(result.statut);
      showToast('Commande envoyée, confirmation en cours...');
    } catch (err) {
      setError('Erreur lors de la validation de la commande');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleUpdateQuantite = async (produitId, quantite) => {
    if (quantite < 1) return;
    try {
      await updateQuantite(produitId, quantite);
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleRemove = async (produitId) => {
    try {
      await removeItem(produitId);
      showToast('Article retiré du panier');
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <button onClick={() => navigate('/accueil')} className="text-purple-300 hover:text-purple-200 mb-6">
          &larr; Retour au catalogue
        </button>

        <h1 className="text-3xl font-bold text-white mb-8 animate-fade-in-up">Mon panier</h1>

        {loading ? (
          <div className="space-y-4">
            <SkeletonLine className="h-20 w-full" />
            <SkeletonLine className="h-20 w-full" />
          </div>
        ) : commande ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 animate-scale-in">
            <p className="text-white text-lg">{STATUT_LABELS[statut] || 'Statut inconnu'}</p>
            {statut === 'reussie' && (
              <button
                onClick={() => navigate('/accueil')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
              >
                Retour au catalogue
              </button>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center animate-fade-in-up">
            <p className="text-white/60">Votre panier est vide.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.produit_id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <img
                    src={resolveImageUrl(item.image_url)}
                    alt={item.nom}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{item.nom}</h3>
                    <p className="text-purple-300 font-bold">{Number(item.prix).toLocaleString('fr-FR')} CDF</p>
                    <p className={`text-xs ${item.quantite >= item.stock ? 'text-orange-300' : 'text-white/40'}`}>
                      {item.stock} en stock
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantite(item.produit_id, item.quantite - 1)}
                      className="w-8 h-8 bg-white/10 rounded-lg text-white hover:bg-white/20 transition"
                    >
                      -
                    </button>
                    <span className="text-white w-8 text-center">{item.quantite}</span>
                    <button
                      onClick={() => handleUpdateQuantite(item.produit_id, Math.min(item.stock, item.quantite + 1))}
                      disabled={item.quantite >= item.stock}
                      className="w-8 h-8 bg-white/10 rounded-lg text-white hover:bg-white/20 transition disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.produit_id)}
                    className="text-red-300 hover:text-red-200 transition text-sm"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex justify-between text-white text-lg font-semibold">
                <span>Total</span>
                <span className="text-purple-300">{total.toLocaleString('fr-FR')} CDF</span>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="0891234567"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={envoiEnCours}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
                >
                  {envoiEnCours ? 'Envoi en cours...' : 'Confirmer la commande'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Panier;
