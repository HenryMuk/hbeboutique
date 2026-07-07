import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { SkeletonLine } from '../../components/SkeletonCard';
import { apiFetch } from '../../api/client';
import { usePanier } from '../../contexts/PanierContext';
import { useToast } from '../../contexts/ToastContext';
import { resolveImageUrl } from '../../utils/media';

function pickAleatoires(liste, n) {
  const copie = [...liste];
  const resultat = [];
  while (copie.length && resultat.length < n) {
    const index = Math.floor(Math.random() * copie.length);
    resultat.push(copie.splice(index, 1)[0]);
  }
  return resultat;
}

const DetailProduit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = usePanier();
  const { showToast } = useToast();

  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantite, setQuantite] = useState(1);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [likeEnCours, setLikeEnCours] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [signalerOuvert, setSignalerOuvert] = useState(false);
  const [motif, setMotif] = useState('');
  const [signalementEnvoye, setSignalementEnvoye] = useState(false);
  const [autresProduits, setAutresProduits] = useState([]);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/produits/${id}`)
      .then(setProduit)
      .catch(() => setProduit(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    apiFetch('/produits', { auth: false })
      .then((liste) => setAutresProduits(liste.filter((p) => String(p.id) !== String(id))))
      .catch(() => setAutresProduits([]));
  }, [id]);

  const suggestions = useMemo(() => pickAleatoires(autresProduits, 4), [autresProduits]);

  const enRupture = produit && produit.stock <= 0;

  const handleAjouterAuPanier = async () => {
    if (enRupture) return;
    setAjoutEnCours(true);
    try {
      await addItem(id, quantite);
      showToast('Ajouté au panier');
    } catch (err) {
      showToast("Erreur lors de l'ajout au panier", 'error');
    } finally {
      setAjoutEnCours(false);
    }
  };

  const handleToggleLike = async () => {
    if (likeEnCours) return;
    setLikeEnCours(true);
    setHeartAnim(true);
    try {
      const result = await apiFetch(`/produits/${id}/like`, { method: 'POST' });
      setProduit((prev) => ({ ...prev, likesCount: result.likesCount, estLikePar: result.liked }));
    } catch (err) {
      showToast('Erreur lors du like', 'error');
    } finally {
      setLikeEnCours(false);
      setTimeout(() => setHeartAnim(false), 350);
    }
  };

  const handleSignaler = async (e) => {
    e.preventDefault();
    if (!motif.trim()) return;
    try {
      await apiFetch(`/produits/${id}/signaler`, { method: 'POST', body: { motif } });
      setSignalementEnvoye(true);
      setMotif('');
      showToast('Signalement envoyé, merci');
      setTimeout(() => {
        setSignalerOuvert(false);
        setSignalementEnvoye(false);
      }, 1500);
    } catch (err) {
      showToast('Erreur lors de l\'envoi du signalement', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="container mx-auto max-w-4xl p-6">
          <SkeletonLine className="h-80 w-full mb-6" />
          <SkeletonLine className="h-8 w-1/2 mb-4" />
          <SkeletonLine className="h-4 w-full mb-2" />
          <SkeletonLine className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!produit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-white/60">Produit introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="container mx-auto max-w-4xl p-6">
        <button onClick={() => navigate('/accueil')} className="text-purple-300 hover:text-purple-200 mb-6">
          &larr; Retour au catalogue
        </button>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-fade-in-up">
          <img
            src={resolveImageUrl(produit.image_url)}
            alt={produit.nom}
            className="w-full h-80 md:h-full object-cover"
          />

          <div className="p-8 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-white">{produit.nom}</h1>
              <button
                onClick={handleToggleLike}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                <svg
                  className={`w-5 h-5 transition-colors ${heartAnim ? 'animate-heart-pulse' : ''} ${
                    produit.estLikePar ? 'fill-pink-500 text-pink-500' : 'fill-none text-white/70'
                  }`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 10-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-white/80 text-sm">{produit.likesCount}</span>
              </button>
            </div>

            <p className="text-white/60">{produit.description}</p>
            <p className="text-2xl font-bold text-purple-300">
              {Number(produit.prix).toLocaleString('fr-FR')} CDF
            </p>
            <p className={`text-sm font-medium ${enRupture ? 'text-red-300' : 'text-green-300'}`}>
              {enRupture ? 'Rupture de stock' : `${produit.stock} en stock`}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                  disabled={enRupture}
                  className="w-9 h-9 bg-white/10 rounded-lg text-white hover:bg-white/20 transition disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-white w-8 text-center">{quantite}</span>
                <button
                  onClick={() => setQuantite((q) => Math.min(produit.stock, q + 1))}
                  disabled={enRupture}
                  className="w-9 h-9 bg-white/10 rounded-lg text-white hover:bg-white/20 transition disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAjouterAuPanier}
                disabled={ajoutEnCours || enRupture}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
              >
                {enRupture ? 'Rupture de stock' : ajoutEnCours ? 'Ajout...' : 'Ajouter au panier'}
              </button>
            </div>

            <div>
              <button
                onClick={() => setSignalerOuvert((v) => !v)}
                className="text-white/50 hover:text-white/80 text-sm transition"
              >
                Signaler ce produit
              </button>
              {signalerOuvert && (
                <form onSubmit={handleSignaler} className="mt-3 space-y-2 animate-scale-in">
                  {signalementEnvoye ? (
                    <p className="text-green-300 text-sm">Merci, votre signalement a été envoyé.</p>
                  ) : (
                    <>
                      <textarea
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        placeholder="Décrivez le problème..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition border border-red-500/30"
                      >
                        Envoyer le signalement
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Suggestions d'autres articles</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestions.map((suggestion, index) => (
                <Link
                  key={suggestion.id}
                  to={`/produit/${suggestion.id}`}
                  className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <img
                    src={resolveImageUrl(suggestion.image_url)}
                    alt={suggestion.nom}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="text-white text-sm truncate">{suggestion.nom}</p>
                    <p className="text-purple-300 text-sm font-semibold">
                      {Number(suggestion.prix).toLocaleString('fr-FR')} CDF
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailProduit;
